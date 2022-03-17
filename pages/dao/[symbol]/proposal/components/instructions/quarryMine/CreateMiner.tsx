import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import {
  SolanaAugmentedProvider,
  SolanaProvider,
} from '@saberhq/solana-contrib'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  QuarryMineCreateMinerForm,
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
import { createMinerInstruction } from '@tools/sdk/quarryMine/createMiner'
import { Wallet } from '@project-serum/common'
import Select from '@components/inputs/Select'
import quarryMineConfiguration from '@tools/sdk/quarryMine/configuration'

const CreateMiner = ({
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
  const [form, setForm] = useState<QuarryMineCreateMinerForm>({})
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
      !form.mintName
    ) {
      return invalid
    }

    const pubkey = getGovernedAccountPublicKey(form.governedAccount, true)

    if (!pubkey) return invalid

    const tx = await createMinerInstruction({
      augmentedProvider: new SolanaAugmentedProvider(
        SolanaProvider.load({
          connection: connection.current,
          sendConnection: connection.current,
          wallet: wallet as Wallet,
        })
      ),

      authority: pubkey,
      payer: wallet.publicKey,
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
    </>
  )
}

export default CreateMiner
