import sqlite3 from "sqlite3";
import { reactive } from "vue";

export interface ProposalRecord {
  id: number;
  proposal_id: number;
  title: string;
  overview: string;
  ipfs_address: string;
}

export const useDB = () => {
  sqlite3.verbose();
  const db = new sqlite3.Database(
    "./db/mygovernance.db",
    sqlite3.OPEN_READWRITE,
    (err) => {
      if (err) {
        console.error(err);
        return;
      }
    }
  );

  const getProposalList = () => {
    const errors: string[] = [];
    let res: ProposalRecord[] = [];
    db.all<ProposalRecord>("SELECT * FROM proposal", [], (err, rows) => {
      if (err) {
        console.error(err);
        errors.push(err.message);
        return;
      }
      res = rows;
    });

    return { res, errors };
  };

  const proposalRecordRes = reactive<ProposalRecord>({
    id: 0,
    proposal_id: 0,
    title: "",
    overview: "",
    ipfs_address: "",
  });

  const setProposalRecord = (id: number) => {
    const errors: string[] = [];
    db.get<ProposalRecord>(
      "SELECT * FROM proposal WHERE id = ?",
      id,
      (err, row) => {
        if (err) {
          console.error(err);
          errors.push(err.message);
          return;
        }

        Object.assign(proposalRecordRes, {
          id: row.id,
          proposal_id: row.proposal_id,
          title: row.title,
          overview: row.overview,
          ipfs_address: row.ipfs_address,
        });
      }
    );

    return errors;
  };

  const setProposalRecordByIpfsAddr = (ipfsAddr: string) => {
    const errors: string[] = [];
    db.get<ProposalRecord>(
      "SELECT * FROM proposal WHERE ipfs_address = ?",
      ipfsAddr,
      (err, row) => {
        if (err) {
          console.error(err);
          errors.push(err.message);
          return;
        }

        Object.assign(proposalRecordRes, {
          id: row.id,
          proposal_id: row.proposal_id,
          title: row.title,
          overview: row.overview,
          ipfs_address: row.ipfs_address,
        });
      }
    );

    return errors;
  };

  const createProposalRecord = (proposal: ProposalRecord) => {
    const errors: string[] = [];
    db.run(
      "INSERT INTO proposal(proposal_id, title, overview, ipfs_address) VALUES (:proposal_id, :title, :overview, :ipfs_address)",
      {
        ":proposal_id": proposal.proposal_id,
        ":title": proposal.title,
        ":overview": proposal.overview,
        ":ipfs_address": proposal.ipfs_address,
      },
      (err) => {
        if (err) {
          console.error(err);
          errors.push(err.message);
          return;
        }
      }
    );

    const setProposalErrs = setProposalRecordByIpfsAddr(proposal.ipfs_address);
    if (setProposalErrs.length > 0) {
      return setProposalErrs;
    }

    return errors;
  };

  return {
    getProposalList,
    proposalRecordRes,
    setProposalRecord,
    setProposalRecordByIpfsAddr,
    createProposalRecord,
  };
};
