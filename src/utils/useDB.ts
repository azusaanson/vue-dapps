import { FIREBASE_CONFIG } from "@/consts/index";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  addDoc,
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { reactive } from "vue";

export interface ProposalRecordInput {
  proposal_id: string;
  title: string;
  overview: string;
  target_contract_addresses: string[];
  eth_values: number[];
  call_datas: string[];
  call_data_descriptions: string[];
  created_at: number;
}

export interface ProposalRecordOutput {
  id: string;
  proposal_id: string;
  title: string;
  overview: string;
  target_contract_addresses: string[];
  eth_values: number[];
  call_datas: string[];
  call_data_descriptions: string[];
  created_at: number;
}

export const useDB = () => {
  const app = initializeApp(FIREBASE_CONFIG);
  const db = getFirestore(app);

  const getProposalRecordList = async () => {
    const errors: string[] = [];
    const records: ProposalRecordOutput[] = [];

    const querySnapshot = await getDocs(collection(db, "proposal")).catch(
      (err) => {
        if (err) {
          console.error(err);
          errors.push(err.message);
          return;
        }
      }
    );

    if (!querySnapshot) {
      return { records, errors };
    }

    querySnapshot.forEach((doc) => {
      const record: ProposalRecordOutput = {
        id: doc.id,
        proposal_id: doc.data().proposal_id,
        title: doc.data().title,
        overview: doc.data().overview,
        target_contract_addresses: doc.data().target_contract_addresses,
        eth_values: doc.data().eth_values,
        call_datas: doc.data().call_datas,
        call_data_descriptions: doc.data().call_data_descriptions,
        created_at: doc.data().created_at,
      };
      records.push(record);
    });

    return { records, errors };
  };

  const proposalRecordOutput = reactive<ProposalRecordOutput>({
    id: "",
    proposal_id: "",
    title: "",
    overview: "",
    target_contract_addresses: [],
    eth_values: [],
    call_datas: [],
    call_data_descriptions: [],
    created_at: 0,
  });

  const setProposalRecord = async (id: string) => {
    const docRef = doc(db, "proposal", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      Object.assign(proposalRecordOutput, {
        id: docSnap.id,
        proposal_id: docSnap.data().proposal_id,
        title: docSnap.data().title,
        overview: docSnap.data().overview,
        target_contract_addresses: docSnap.data().target_contract_addresses,
        eth_values: docSnap.data().eth_values,
        call_datas: docSnap.data().call_datas,
        call_data_descriptions: docSnap.data().call_data_descriptions,
        created_at: docSnap.data().created_at,
      });
    }
  };

  const createProposalRecord = async (newProposal: ProposalRecordInput) => {
    const errors: string[] = [];

    const docRef = await addDoc(collection(db, "proposal"), newProposal).catch(
      (err) => {
        if (err) {
          console.error(err);
          errors.push(err.message);
          return;
        }
      }
    );

    if (!docRef) {
      return { id: "", errors };
    }

    return { id: docRef.id, errors };
  };

  return {
    getProposalRecordList,
    proposalRecordOutput,
    setProposalRecord,
    createProposalRecord,
  };
};
