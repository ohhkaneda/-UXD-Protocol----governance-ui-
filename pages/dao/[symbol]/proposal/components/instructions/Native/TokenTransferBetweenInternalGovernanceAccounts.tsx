import * as yup from 'yup';
import React from 'react';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';

import { TokenTransferBetweenInternalGovernanceAccountsForm } from '@utils/uiTypes/proposalCreationTypes';
import Input from '@components/inputs/Input';
import useGovernanceUnderlyingTokenAccounts from '@hooks/useGovernanceUnderlyingTokenAccounts';
import TokenAccountSelect from '../../TokenAccountSelect';
import { PublicKey } from '@solana/web3.js';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { uiAmountToNativeBN } from '@tools/sdk/units';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  sourceAccount: yup.string().required('Source Account is required'),
  receiverAccount: yup.string().required('Receiver Account is required'),
  //* Let's keep it aside for now until we fully refactor all transfer instructions into a single smarter one
  // .test((value?: string) => {
  //   if (!value || !form.sourceAccount || !ownedTokenAccountsInfo)
  //     return false;

  //   if (value === form.sourceAccount.toString()) {
  //     return new yup.ValidationError('source and destination are the same');
  //   }

  //   const { mint: mintReceiver } = ownedTokenAccountsInfo[value];
  //   const { mint: mintSource } = ownedTokenAccountsInfo[
  //     form.sourceAccount.toString()
  //   ];

  //   const equals = mintSource.equals(mintReceiver);

  //   if (!equals) {
  //     return new yup.ValidationError(
  //       'source and destination mint are different',
  //     );
  //   }

  //   return true;
  // }),
});

const TokenTransferBetweenInternalGovernanceAccounts = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    form,
    formErrors,
    handleSetForm,
    governedAccountPubkey,
  } = useInstructionFormBuilder<TokenTransferBetweenInternalGovernanceAccountsForm>(
    {
      index,
      initialFormValues: {
        governedAccount,
      },
      schema,
      buildInstruction: async function ({ form, governedAccountPubkey }) {
        if (!ownedTokenAccountsInfo)
          throw new Error('could not load ownedTokenAccountsInfo');
        const { mintDecimals } = ownedTokenAccountsInfo![form.sourceAccount!]!;

        return Token.createTransferInstruction(
          TOKEN_PROGRAM_ID,
          new PublicKey(form.sourceAccount!),
          new PublicKey(form.receiverAccount!),
          governedAccountPubkey,
          [],
          uiAmountToNativeBN(form.uiAmount!, mintDecimals).toNumber(),
        );
      },
    },
  );

  const { ownedTokenAccountsInfo } = useGovernanceUnderlyingTokenAccounts(
    governedAccountPubkey ?? undefined,
  );

  return (
    ownedTokenAccountsInfo && (
      <>
        <TokenAccountSelect
          label="Source Account"
          value={form.sourceAccount?.toString()}
          onChange={(value) =>
            handleSetForm({ value, propertyName: 'sourceAccount' })
          }
          error={formErrors['sourceAccount']}
          ownedTokenAccountsInfo={ownedTokenAccountsInfo}
        />

        <TokenAccountSelect
          label="Receiver Account"
          value={form.receiverAccount?.toString()}
          onChange={(value) =>
            handleSetForm({ value, propertyName: 'receiverAccount' })
          }
          error={formErrors['receiverAccount']}
          ownedTokenAccountsInfo={ownedTokenAccountsInfo}
        />

        <Input
          label="Amount to transfer"
          value={form.uiAmount}
          type="string"
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
  );
};

export default TokenTransferBetweenInternalGovernanceAccounts;
