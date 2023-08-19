import { createHelia } from "helia";
import { json } from "@helia/json";
import { CID } from "multiformats/cid";
import { reactive } from "vue";

export interface ProposalIpfsRecord {
  proposal_id: string;
  title: string;
  overview: string;
  target_contract_addresses: string[];
  eth_values: number[];
  call_datas: string[];
  call_data_descriptions: string[];
  created_at: number;
}

export const useIpfs = async () => {
  const helia = await createHelia();
  const heliaJson = json(helia);

  const proposalIpfsRecord = reactive<ProposalIpfsRecord>({
    proposal_id: "",
    title: "",
    overview: "",
    target_contract_addresses: [],
    eth_values: [],
    call_datas: [],
    call_data_descriptions: [],
    created_at: 0,
  });

  const setProposalIpfsRecord = async (ipfsAddr: string) => {
    const errors: string[] = [];

    const cid = CID.parse(ipfsAddr);
    const res = await heliaJson.get<ProposalIpfsRecord>(cid).catch((err) => {
      if (err) {
        console.error(err);
        errors.push(err.message);
        return;
      }
    });

    if (!res) {
      return errors;
    }

    Object.assign(proposalIpfsRecord, {
      proposal_id: res.proposal_id,
      title: res.title,
      overview: res.overview,
      target_contract_addresses: res.target_contract_addresses,
      eth_values: res.eth_values,
      call_datas: res.call_datas,
      call_data_descriptions: res.call_data_descriptions,
      created_at: res.created_at,
    });

    return errors;
  };

  const createProposalIpfsRecord = async (
    newProposalIpfsRecord: ProposalIpfsRecord
  ) => {
    const errors: string[] = [];

    const ipfsAddrRes = await heliaJson
      .add(newProposalIpfsRecord)
      .catch((err) => {
        if (err) {
          console.error(err);
          errors.push(err.message);
          return;
        }
      });

    if (!ipfsAddrRes) {
      return { errors, ipfsAddress: "" };
    }

    return { errors, ipfsAddress: String(ipfsAddrRes) };
  };

  return {
    proposalIpfsRecord,
    setProposalIpfsRecord,
    createProposalIpfsRecord,
  };
};
