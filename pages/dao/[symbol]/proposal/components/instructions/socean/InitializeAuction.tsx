import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  SoceanInitializeAuctionForm,
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
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import { initializeAuction } from '@tools/sdk/socean/initializeAuction'
import { BN } from '@project-serum/anchor'
import soceanConfiguration from '@tools/sdk/socean/configuration'
import { SPLToken } from '@saberhq/token-utils'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'

const InitializeAuction = ({
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
  const [form, setForm] = useState<SoceanInitializeAuctionForm>({})
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

  async function createInstruction({
    authority,
    connection,
    newAccountPubkey,
    size,
    programId,
  }: {
    authority: PublicKey
    connection: Connection
    newAccountPubkey: PublicKey
    size: number
    programId: PublicKey
  }): Promise<TransactionInstruction> {
    return SystemProgram.createAccount({
      fromPubkey: authority,
      newAccountPubkey,
      space: size,
      lamports: await connection.getMinimumBalanceForRentExemption(size),
      programId,
    })
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
      !form.paymentMint ||
      !form.paymentDestination ||
      !form.saleMint ||
      !form.startTimestamp ||
      !form.endTimestamp ||
      !form.ceilPrice ||
      !form.floorPrice
    ) {
      return invalid
    }

    const pubkey = getGovernedAccountPublicKey(form.governedAccount, true)

    if (!pubkey) return invalid

    const auction = new PublicKey(
      '7gosT4aHXuFkHuJqCiKR1x5qFDWmvjcZ511B2gAvizmu'
    ) //Keypair.generate()

    const createAuctionTx = await createInstruction({
      authority: wallet.publicKey,
      newAccountPubkey: auction,
      connection: connection.current,
      size: 224,
      programId:
        soceanConfiguration.descendingAuctionProgramId[connection.cluster],
    })

    /*
    // TODO!!! Transfer the authority of the Auction account to auctionAuthority
    const assignAuctionAccountToDescendingAuctionProgramTx = SystemProgram.assign(
      {
        accountPubkey: auction.publicKey,
        programId:
          soceanConfiguration.descendingAuctionProgramId[connection.cluster],
      }
    )*/

    console.log('auction Pubkey', auction.toString())

    const { tx, auctionAuthority, auctionPool } = await initializeAuction({
      cluster: connection.cluster,
      program: programs.DescendingAuction,
      auction,
      authority: pubkey,
      paymentMint: form.paymentMint,
      paymentDestination: form.paymentDestination,
      saleMint: form.saleMint,
      startTimestamp: new BN(form.startTimestamp),
      endTimestamp: new BN(form.endTimestamp),
      ceilPrice: new BN(form.ceilPrice),
      floorPrice: new BN(form.floorPrice),
    })

    const createAuctionPoolTx = await createInstruction({
      authority: wallet.publicKey,
      newAccountPubkey: auctionPool,
      connection: connection.current,
      size: 165,
      programId: SystemProgram.programId,
    })

    const initAuctionPoolAccountTx = SPLToken.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      form.saleMint,
      auctionPool,
      auctionAuthority
    )

    /*
    const createAuctionPoolTxs = await createTokenAccountInstructions(
      connection.current,
      wallet.publicKey,
      auctionPool,
      form.saleMint,
      auctionAuthority
    )*/

    /*
    const [createAuctionPoolATATx] = await createAssociatedTokenAccount(
      wallet.publicKey,
      auction.publicKey, // <---
      form.saleMint,
      auctionAuthority
    )
*/
    // TODO!!! Set auctionAuthority as owner of the Auction Pool ATA

    return {
      serializedInstruction: serializeInstructionToBase64(tx),
      isValid: true,
      governance: form.governedAccount.governance,
      prerequisiteInstructions: [
        createAuctionTx,
        // assignAuctionAccountToDescendingAuctionProgramTx,
        createAuctionPoolTx,
        initAuctionPoolAccountTx,
        //...createAuctionPoolTxs,
      ],
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
    paymentMint: yup.string().required('Payment mint is required'),
    paymentDestination: yup
      .string()
      .required('Payment destination is required'),
    saleMint: yup.string().required('Sale mint is required'),
    startTimestamp: yup.string().required('Start timestamp is required'),
    endTimestamp: yup.string().required('End timestamp is required'),
    ceilPrice: yup
      .number()
      .moreThan(0, 'Ceil price should be more than 0')
      .required('Ceil price is required'),
    floorPrice: yup
      .number()
      .test((value?: number) => {
        if (value === void 0 || form.ceilPrice === void 0) return false

        if (value > form.ceilPrice) {
          return new yup.ValidationError(
            'floor price must be smaller than ceil price'
          )
        }

        return true
      })
      .moreThan(0, 'Floor price should be more than 0')
      .required('Floor price is required'),
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
        label="Payment Mint"
        value={form.paymentMint}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: new PublicKey(evt.target.value),
            propertyName: 'paymentMint',
          })
        }
        error={formErrors['paymentMint']}
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
        label="Sale Mint"
        value={form.saleMint}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: new PublicKey(evt.target.value),
            propertyName: 'saleMint',
          })
        }
        error={formErrors['saleMint']}
      />

      <Input
        label="Start Timestamp"
        value={form.startTimestamp}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'startTimestamp',
          })
        }
        error={formErrors['startTimestamp']}
      />

      <Input
        label="End Timestamp"
        value={form.endTimestamp}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'endTimestamp',
          })
        }
        error={formErrors['endTimestamp']}
      />

      <Input
        label="Ceil Price"
        value={form.ceilPrice}
        type="number"
        min="0"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'ceilPrice',
          })
        }
        error={formErrors['ceilPrice']}
      />

      <Input
        label="Floor Price"
        value={form.floorPrice}
        type="number"
        min="0"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'floorPrice',
          })
        }
        error={formErrors['floorPrice']}
      />
    </>
  )
}

export default InitializeAuction
