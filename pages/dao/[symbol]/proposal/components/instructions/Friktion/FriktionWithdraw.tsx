import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import Input from '@components/inputs/Input'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import useWalletStore from 'stores/useWalletStore'
import TokenAccountSelect from '../../TokenAccountSelect'
import {
  FriktionWithdrawForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { getFriktionWithdrawInstruction } from '@utils/instructionTools'
import Select from '@components/inputs/Select'
import { FriktionSnapshot, VoltSnapshot } from '@friktion-labs/friktion-sdk'
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'
import useGovernanceUnderlyingTokenAccounts from '@hooks/useGovernanceUnderlyingTokenAccounts'
import { BN } from '@project-serum/anchor'

const FriktionWithdraw = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId

  const [form, setForm] = useState<FriktionWithdrawForm>({
    programId: programId?.toString(),
  })

  const [friktionVolts, setFriktionVolts] = useState<VoltSnapshot[] | null>(
    null
  )

  const [friktionVolt, setFriktionVolt] = useState<VoltSnapshot | null>(null)

  const [formErrors, setFormErrors] = useState({})

  const {
    governedMultiTypeAccounts,
    getGovernedAccountPublicKey,
  } = useGovernedMultiTypeAccounts()

  const pubkey = form.governedAccount
    ? getGovernedAccountPublicKey(form.governedAccount, true)
    : null

  const { ownedTokenAccountsInfo } = useGovernanceUnderlyingTokenAccounts(
    pubkey ?? undefined
  )

  const { handleSetInstructions } = useContext(NewProposalContext)

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  async function getInstruction(): Promise<UiInstruction> {
    const invalid = {
      serializedInstruction: '',
      isValid: false,
      governance: form.governedAccount?.governance,
    }

    if (
      !form.governedAccount ||
      !form.uiAmount ||
      !pubkey ||
      !form.underlyingTokenDestination
    ) {
      return invalid
    }

    return getFriktionWithdrawInstruction({
      schema,
      form,
      authority: pubkey,
      uiAmount: new BN(form.uiAmount),
      programId,
      connection,
      wallet,
      setFormErrors,
    })
  }

  useEffect(() => {
    // call for the mainnet friktion volts
    const callfriktionRequest = async () => {
      const response = await fetch(
        'https://friktion-labs.github.io/mainnet-tvl-snapshots/friktionSnapshot.json'
      )
      const parsedResponse = (await response.json()) as FriktionSnapshot
      setFriktionVolts(parsedResponse.allMainnetVolts as VoltSnapshot[])
    }

    callfriktionRequest()
  }, [])

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [realmInfo?.programId])

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
    governedAccount: yup.object().required('Governance is required'),
    underlyingTokenDestination: yup
      .string()
      .typeError('Underlying Token Destination is required'),
    uiAmount: yup.number().typeError('Amount is required'),
  })

  // To get vaults that are not in circuit
  // Change to ?.filter((x) => !x.isInCircuits)

  // Now I have allowed only one vault -> 9cHT8d7d35ngj5i8WBZB8ibjnPLnvnym4tp4KoTCQtxw, our vault

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

      {ownedTokenAccountsInfo && (
        <>
          <Select
            label="Friktion Volt"
            value={form.voltVaultId}
            placeholder="Please select..."
            onChange={(value) => {
              const volt = friktionVolts?.find(
                (volt) => volt.voltVaultId === value
              )

              setFriktionVolt(volt ?? null)

              handleSetForm({ value, propertyName: 'voltVaultId' })
            }}
            error={formErrors['voltVaultId']}
          >
            {(friktionVolts ?? [])
              .filter(
                (x) =>
                  x.voltVaultId ===
                  '9cHT8d7d35ngj5i8WBZB8ibjnPLnvnym4tp4KoTCQtxw'
              )
              .map((value) => (
                <Select.Option
                  key={value.voltVaultId}
                  value={value.voltVaultId}
                >
                  <div className="break-all text-fgd-1 ">
                    <div className="mb-2">{`Volt #${value.voltType} - ${
                      value.voltType === 1
                        ? 'Generate Income'
                        : value.voltType === 2
                        ? 'Sustainable Stables'
                        : ''
                    } - ${value.underlyingTokenSymbol} - APY: ${
                      value.apy
                    }%`}</div>
                    <div className="space-y-0.5 text-xs text-fgd-3">
                      <div className="flex items-center">
                        Deposit Token: {value.depositTokenSymbol}
                      </div>
                      {/* <div>Capacity: {}</div> */}
                    </div>
                  </div>
                </Select.Option>
              ))}
          </Select>

          <TokenAccountSelect
            label="Underlying Token Destination"
            value={form.underlyingTokenDestination?.toString()}
            filterByMint={
              friktionVolt
                ? [new PublicKey(friktionVolt.depositTokenMint)]
                : undefined
            }
            onChange={(value) =>
              handleSetForm({
                value,
                propertyName: 'underlyingTokenDestination',
              })
            }
            error={formErrors['underlyingTokenDestination']}
            ownedTokenAccountsInfo={ownedTokenAccountsInfo}
          />

          <Input
            min={0}
            label="Amount"
            value={form.uiAmount}
            type="number"
            onChange={(evt) => {
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiAmount',
              })
            }}
            error={formErrors['uiAmount']}
          />
        </>
      )}
    </>
  )
}

export default FriktionWithdraw
