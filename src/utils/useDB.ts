import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { reactive } from "vue";

export interface ProposalRecord {
  id: number;
  proposal_id: number;
  title: string;
  overview: string;
  ipfs_address: string;
}

export const useDB = async () => {
  const proposalRecord = reactive<ProposalRecord>({
    id: 0,
    proposal_id: 0,
    title: "",
    overview: "",
    ipfs_address: "",
  });

  sqlite3.verbose();

  const db = await open({
    filename: "./db/mygovernance.db",
    driver: sqlite3.Database,
  });

  const getProposalList = async () => {
    const results = await db
      .all<ProposalRecord[]>("SELECT * FROM proposal")
      .catch((err) => {
        console.error(err);
        return undefined;
      });

    if (!results) {
      return [];
    }

    return results;
  };

  const setProposalRecord = async (id: number) => {
    const errors: string[] = [];
    const result = await db
      .get<ProposalRecord>("SELECT * FROM proposal WHERE id = ?", id)
      .catch((err) => {
        console.error(err);
        errors.push(err);
      });

    if (!result) {
      errors.push("db error: cannot setProposalRecord");
      return errors;
    }

    Object.assign(proposalRecord, {
      id: result.id,
      proposal_id: result.proposal_id,
      title: result.title,
      overview: result.overview,
      ipfs_address: result.ipfs_address,
    });

    return errors;
  };

  const setProposalRecordByIpfsAddr = async (ipfsAddr: string) => {
    const errors: string[] = [];
    const result = await db
      .get<ProposalRecord>(
        "SELECT * FROM proposal WHERE ipfs_address = ?",
        ipfsAddr
      )
      .catch((err) => {
        console.error(err);
        errors.push(err);
      });

    if (!result) {
      errors.push("db error: cannot setProposalRecordByIpfsAddr");
      return errors;
    }

    Object.assign(proposalRecord, {
      id: result.id,
      proposal_id: result.proposal_id,
      title: result.title,
      overview: result.overview,
      ipfs_address: result.ipfs_address,
    });

    return errors;
  };

  const createProposalRecord = async (proposal: ProposalRecord) => {
    const errors: string[] = [];
    const result = await db
      .run(
        "INSERT INTO proposal(proposal_id, title, overview, ipfs_address) VALUES (:proposal_id, :title, :overview, :ipfs_address)",
        {
          ":proposal_id": proposal.proposal_id,
          ":title": proposal.title,
          ":overview": proposal.overview,
          ":ipfs_address": proposal.ipfs_address,
        }
      )
      .catch((err) => {
        console.error(err);
        errors.push(err);
      });

    if (!result) {
      errors.push("db error: cannot createProposalRecord");
      return errors;
    }

    const setProposalErr = await setProposalRecordByIpfsAddr(
      proposal.ipfs_address
    );

    if (setProposalErr.length > 0) {
      return setProposalErr;
    }

    return errors;
  };

  return {
    proposalRecord,
    getProposalList,
    setProposalRecord,
    setProposalRecordByIpfsAddr,
    createProposalRecord,
  };
};
