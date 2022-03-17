import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import {
  SolanaAugmentedProvider,
  SolanaProvider,
} from '@saberhq/solana-contrib'
import { isFormValid } from '@utils/formValidation'
import { PublicKey } from '@solana/web3.js'
import {
  UiInstruction,
  QuarryMineStakeTokensForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import useWalletStore from 'stores/useWalletStore'
import {
  ProgramAccount,
  serializeInstructionToBase64,
  Governance,
} from '@solana/spl-governance'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'
import { Wallet } from '@project-serum/common'
import { stakeTokensInstruction } from '@tools/sdk/quarryMine/stakeTokens'
import { BN } from '@project-serum/anchor'
import Input from '@components/inputs/Input'
import TokenAccountSelect from '../TokenAccountSelect'
import useGovernanceUnderlyingTokenAccounts from '@hooks/useGovernanceUnderlyingTokenAccounts'
import BigNumber from 'bignumber.js'
import Select from '@components/inputs/Select'
import quarryMineConfiguration from '@tools/sdk/quarryMine/configuration'

const StakeTokens = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)

  const {
    governedMultiTypeAccounts,
    getGovernedAccountPublicKey,
  } = useGovernedMultiTypeAccounts()

  const shouldBeGoverned = index !== 0 && governance
  const [form, setForm] = useState<QuarryMineStakeTokensForm>({})
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  const pubkey = form.governedAccount
    ? getGovernedAccountPublicKey(form.governedAccount, true)
    : null

  const { ownedTokenAccountsInfo } = useGovernanceUnderlyingTokenAccounts(
    pubkey ?? undefined
  )

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

    const invalid = {
      serializedInstruction: '',
      isValid: false,
      governance: form.governedAccount?.governance,
    }

    if (
      !connection ||
      !isValid ||
      !form.governedAccount?.governance?.account ||
      !wallet?.publicKey ||
      !form.sourceAccount ||
      !form.uiAmount ||
      !pubkey ||
      !ownedTokenAccountsInfo ||
      !form.mintName
    ) {
      return invalid
    }

    const sourceAccount = new PublicKey(form.sourceAccount)

    const { mintDecimals } = ownedTokenAccountsInfo[sourceAccount.toBase58()]!

    const tx = await stakeTokensInstruction({
      augmentedProvider: new SolanaAugmentedProvider(
        SolanaProvider.load({
          connection: connection.current,
          sendConnection: connection.current,
          wallet: wallet as Wallet,
        })
      ),

      authority: pubkey,
      sourceAccount,

      amount: new BN(
        new BigNumber(form.uiAmount).shiftedBy(mintDecimals).toNumber()
      ),

      mintName: form.mintName,
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

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>
  }

  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    mintName: yup.string().required('Mint name is required'),
    sourceAccount: yup.string().required('Source Account is required'),
    uiAmount: yup
      .number()
      .moreThan(0, 'Amount should be more than 0')
      .required('Amount is required'),
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
      />

      <Select
        label="Mint Name"
        value={form.mintName}
        placeholder="Please select..."
        onChange={(value) => {
          handleSetForm({
            value,
            propertyName: 'mintName',
          })
        }}
        error={formErrors['mintName']}
      >
        {Object.keys(quarryMineConfiguration.supportedMintNames).map(
          (supportedMintName) => (
            <Select.Option value={supportedMintName} key={supportedMintName}>
              {supportedMintName}
            </Select.Option>
          )
        )}
      </Select>

      {ownedTokenAccountsInfo ? (
        <TokenAccountSelect
          label="Source Account"
          value={form.sourceAccount}
          onChange={(value) =>
            handleSetForm({ value, propertyName: 'sourceAccount' })
          }
          error={formErrors['sourceAccount']}
          ownedTokenAccountsInfo={ownedTokenAccountsInfo}
        />
      ) : null}

      <Input
        label="Amount"
        value={form.uiAmount}
        type="number"
        min="0"
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

export default StakeTokens
