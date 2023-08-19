import { FIREBASE_CONFIG } from "@/consts/index";
import { initializeApp } from "firebase/app";
import { getFirestore, addDoc, collection, getDocs } from "firebase/firestore";

export const useDB = () => {
  const app = initializeApp(FIREBASE_CONFIG);
  const db = getFirestore(app);

  const getProposalIpfsAddrList = async () => {
    const errors: string[] = [];
    const ipfsAddrs: string[] = [];

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
      return { ipfsAddrs, errors };
    }

    querySnapshot.forEach((doc) => {
      ipfsAddrs.push(doc.data().ipfs_address);
    });

    return { ipfsAddrs, errors };
  };

  const createProposalRecord = async (ipfsAddr: string) => {
    const errors: string[] = [];

    const docRef = await addDoc(collection(db, "proposal"), {
      ipfs_address: ipfsAddr,
    }).catch((err) => {
      if (err) {
        console.error(err);
        errors.push(err.message);
        return;
      }
    });

    if (!docRef) {
      return { id: "", errors };
    }

    return { id: docRef.id, errors };
  };

  return {
    getProposalIpfsAddrList,
    createProposalRecord,
  };
};
