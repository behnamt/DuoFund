#!/usr/bin/env bash
cd packages/contracts
npx oz remove DuFund
npx oz compile
npx oz add DuFund && npx oz push -n development
du_fund_contract_address=`npx oz deploy --no-interactive --network development --kind regular DuFund`

sed -e "s/^\(REACT_APP_DU_FUND_CONTRACT_ADDRESS=\s*\).*\$/\1$du_fund_contract_address/" ../app/.env.local > ../app/.env.tmp
mv ../app/.env.tmp ../app/.env.local


