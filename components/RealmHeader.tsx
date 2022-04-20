import React from 'react';
import useRealm from 'hooks/useRealm';
import { CogIcon, GlobeAltIcon } from '@heroicons/react/outline';
import Link from 'next/link';
import { TwitterIcon } from './icons';
import useQueryContext from 'hooks/useQueryContext';

const RealmHeader = () => {
  const { fmtUrlWithCluster } = useQueryContext();
  const { realmInfo, realmDisplayName, symbol } = useRealm();

  return (
    <div className="pb-4">
      <div className="flex flex-col md:flex-row items-center pb-3  md:justify-between">
        {realmDisplayName ? (
          <div className="flex items-center">
            <div className="flex flex-col md:flex-row items-center pb-3 md:pb-0">
              {realmInfo?.ogImage ? (
                <img
                  className="flex-shrink-0 mb-2 md:mb-0 w-8"
                  src={realmInfo?.ogImage}
                ></img>
              ) : (
                <div className="bg-[rgba(255,255,255,0.1)] h-14 w-14 flex font-bold items-center justify-center rounded-full text-fgd-3">
                  {realmDisplayName?.charAt(0)}
                </div>
              )}
              <h1 className="ml-3">{realmDisplayName}</h1>
            </div>
          </div>
        ) : (
          <div className="animate-pulse bg-bkg-3 h-10 w-40 rounded-md" />
        )}
        <div className="flex items-center space-x-4">
          <Link href={fmtUrlWithCluster(`/dao/${symbol}/params`)}>
            <a className="flex items-center cursor-pointer text-primary-light hover:text-primary-dark text-sm">
              <CogIcon className="flex-shrink-0 h-4 mr-1 w-4" />
              Params
            </a>
          </Link>
          {realmInfo?.website ? (
            <a
              className="default-transition flex items-center text-primary-light hover:text-primary-dark text-sm"
              href={realmInfo?.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GlobeAltIcon className="h-4 mr-1 w-4" />
              Website
            </a>
          ) : null}
          {realmInfo?.twitter ? (
            <a
              className="default-transition flex items-center text-primary-light hover:text-primary-dark text-sm"
              href={`https://twitter.com/${realmInfo?.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <TwitterIcon className="h-4 mr-1 w-4" />
              Twitter
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default RealmHeader;
