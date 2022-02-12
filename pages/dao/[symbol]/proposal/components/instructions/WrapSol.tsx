/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import BigNumber from 'bignumber.js'
import { BN } from '@project-serum/anchor'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  WrapSolForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../new'
import useWalletStore from 'stores/useWalletStore'
import {
  ProgramAccount,
  serializeInstructionToBase64,
  Governance,
} from '@solana/spl-governance'
import GovernedAccountSelect from '../GovernedAccountSelect'
import Input from '@components/inputs/Input'
import { wrapSolInstruction } from '@tools/sdk/splToken/WrapSolInstruction'
import { SOL_DECIMALS } from '@uxdprotocol/uxd-client'
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'

const WrapSol = ({
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
  const [form, setForm] = useState<WrapSolForm>({})
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
      !form.uiAmount
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }

    const tx = await wrapSolInstruction({
      lamports: new BN(
        new BigNumber(form.uiAmount).shiftedBy(SOL_DECIMALS).toString()
      ),
      owner: form.governedAccount?.governance.pubkey,
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
    uiAmount: yup
      .number()
      .moreThan(0, 'Amount to wrap should be more than 0')
      .required('Amount to wrap is required'),
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

      <Input
        label="Amount to wrap"
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
    </>
  )
}

export default WrapSol
