/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import BigNumber from 'bignumber.js'
import { BN } from '@project-serum/anchor'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  UXDRedeemFromMangoDepositoryForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import useWalletStore from 'stores/useWalletStore'
import {
  ProgramAccount,
  serializeInstructionToBase64,
  Governance,
} from '@solana/spl-governance'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import {
  DEPOSITORY_MINTS,
  getDepositoryMintSymbols,
  getInsuranceMintSymbols,
} from '@tools/sdk/uxdProtocol/uxdClient'
import Select from '@components/inputs/Select'
import Input from '@components/inputs/Input'
import createRedeemFromMangoDepositoryInstruction from '@tools/sdk/uxdProtocol/createRedeemFromMangoDepositoryInstruction'
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'

const RedeemFromMangoDepository = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { governedMultiTypeAccounts } = useGovernedMultiTypeAccounts()

  const shouldBeGoverned = index !== 0 && governance
  const [form, setForm] = useState<UXDRedeemFromMangoDepositoryForm>({})
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()

    if (
      !connection ||
      !isValid ||
      !form.governedAccount?.governance?.account ||
      !wallet?.publicKey ||
      !form.uiAmount ||
      !form.slippage ||
      !form.collateralName ||
      !form.insuranceMintName
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }

    const tx = await createRedeemFromMangoDepositoryInstruction({
      amountRedeemable: new BN(
        new BigNumber(form.uiAmount)
          .shiftedBy(
            DEPOSITORY_MINTS[connection.cluster][form.collateralName].decimals
          )
          .toString()
      ),
      slippage: Number(form.slippage),
      connection,
      authority: form.governedAccount?.governance.pubkey,
      depositoryMintName: form.collateralName,
      insuranceMintName: form.insuranceMintName,
    })

    return {
      serializedInstruction: serializeInstructionToBase64(tx),
      isValid: true,
      governance: form.governedAccount.governance,
    }
  }

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: form.governedAccount?.governance,
        getInstruction,
      },
      index
    )
  }, [form])

  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    collateralName: yup.string().required('Collateral name is required'),
    insuranceMintName: yup.string().required('Insurance mint name is required'),
    uiAmount: yup
      .number()
      .moreThan(0, 'Amount to mint should be more than 0')
      .required('Amount to mint is required'),
    slippage: yup
      .number()
      .moreThan(0, 'Slippage should be more than 0')
      .required('Slippage is required'),
  })

  return (
    <>
      <GovernedAccountSelect
        label="Governance"
        governedAccounts={governedMultiTypeAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>

      <Select
        label="Collateral Name"
        value={form.collateralName}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'collateralName' })
        }
        error={formErrors['collateralName']}
      >
        {getDepositoryMintSymbols(connection.cluster).map((value, i) => (
          <Select.Option key={value + i} value={value}>
            {value}
          </Select.Option>
        ))}
      </Select>

      <Select
        label="Insurance Mint Name"
        value={form.insuranceMintName}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'insuranceMintName' })
        }
        error={formErrors['insuranceMintName']}
      >
        {getInsuranceMintSymbols(connection.cluster).map((value, i) => (
          <Select.Option key={value + i} value={value}>
            {value}
          </Select.Option>
        ))}
      </Select>

      <Input
        label="Amount to Redeem"
        value={form.uiAmount}
        type="number"
        min={0}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiAmount',
          })
        }
        error={formErrors['uiAmount']}
      />

      <Input
        label="Slippage"
        value={form.slippage}
        type="number"
        min={0}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'slippage',
          })
        }
        error={formErrors['slippage']}
      />
    </>
  )
}

export default RedeemFromMangoDepository
