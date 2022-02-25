import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  SoceanPurchaseBondedTokensForm,
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
import useSoceanPrograms from '@hooks/useSoceanPrograms'
import Input from '@components/inputs/Input'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@project-serum/anchor'
import { purchase } from '@tools/sdk/socean/purchase'

const PurchaseBondedTokens = ({
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
  const { programs } = useSoceanPrograms()

  const shouldBeGoverned = index !== 0 && governance
  const [form, setForm] = useState<SoceanPurchaseBondedTokensForm>({})
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
      !programs ||
      !form.auction ||
      !form.bondedMint ||
      !form.paymentDestination ||
      !form.buyer ||
      !form.paymentSource ||
      !form.saleDestination ||
      !form.nativePurchaseAmount ||
      !form.nativeExpectedPayment ||
      !form.slippageTolerance
    ) {
      return invalid
    }

    const pubkey = getGovernedAccountPublicKey(form.governedAccount, true)

    if (!pubkey) return invalid

    const tx = await purchase({
      cluster: connection.cluster,
      program: programs.DescendingAuction,
      auction: form.auction,
      bondedMint: form.bondedMint,
      paymentDestination: form.paymentDestination,
      buyer: form.buyer,
      paymentSource: form.paymentSource,
      saleDestination: form.saleDestination,
      purchaseAmount: new BN(form.nativePurchaseAmount),
      expectedPayment: new BN(form.nativeExpectedPayment),
      slippageTolerance: new BN(form.slippageTolerance),
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
    auction: yup.string().required('Auction is required'),
    bondedMint: yup.string().required('Bonded mint is required'),
    paymentDestination: yup
      .string()
      .required('Payment destination is required'),
    buyer: yup.string().required('Buyer is required'),
    paymentSource: yup.string().required('Payment source is required'),
    saleDestination: yup.string().required('Sale destination is required'),
    nativePurchaseAmount: yup
      .number()
      .moreThan(0, 'Purchase amount should be more than 0')
      .required('Purchase amount is required'),
    nativeExpectedPayment: yup
      .number()
      .moreThan(0, 'Expected payment should be more than 0')
      .required('Expected payment is required'),
    slippageTolerance: yup
      .number()
      .moreThan(0, 'Slippage tolerance should be more than 0')
      .required('Slippage tolerance is required'),
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

      <Input
        label="Auction"
        value={form.auction}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: new PublicKey(evt.target.value),
            propertyName: 'auction',
          })
        }
        error={formErrors['auction']}
      />

      <Input
        label="Bonded Mint"
        value={form.bondedMint}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: new PublicKey(evt.target.value),
            propertyName: 'bondedMint',
          })
        }
        error={formErrors['bondedMint']}
      />

      <Input
        label="Payment Destination"
        value={form.paymentDestination}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: new PublicKey(evt.target.value),
            propertyName: 'paymentDestination',
          })
        }
        error={formErrors['paymentDestination']}
      />

      <Input
        label="Buyer"
        value={form.buyer}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: new PublicKey(evt.target.value),
            propertyName: 'buyer',
          })
        }
        error={formErrors['buyer']}
      />

      <Input
        label="Payment Source"
        value={form.paymentSource}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: new PublicKey(evt.target.value),
            propertyName: 'paymentSource',
          })
        }
        error={formErrors['paymentSource']}
      />

      <Input
        label="Sale Destination (bonded token TA/ATA)"
        value={form.saleDestination}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: new PublicKey(evt.target.value),
            propertyName: 'saleDestination',
          })
        }
        error={formErrors['saleDestination']}
      />

      <Input
        label="Native Purchase Amount"
        value={form.nativePurchaseAmount}
        type="number"
        min="0"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'nativePurchaseAmount',
          })
        }
        error={formErrors['nativePurchaseAmount']}
      />

      <Input
        label="Native Expected Payment"
        value={form.nativeExpectedPayment}
        type="number"
        min="0"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'nativeExpectedPayment',
          })
        }
        error={formErrors['nativeExpectedPayment']}
      />

      <Input
        label="Slippage Tolerance (100 = 10%)"
        value={form.slippageTolerance}
        type="number"
        min="0"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'slippageTolerance',
          })
        }
        error={formErrors['slippageTolerance']}
      />
    </>
  )
}

export default PurchaseBondedTokens
