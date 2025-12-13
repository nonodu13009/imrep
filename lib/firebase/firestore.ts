import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./config";

export async function getDocument<T = DocumentData>(
  collectionName: string,
  documentId: string
): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    console.error(`Erreur lors de la récupération du document ${collectionName}/${documentId}:`, error);
    throw error;
  }
}

export async function getCollection<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  try {
    const collectionRef = collection(db, collectionName);
    const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  } catch (error) {
    console.error(`Erreur lors de la récupération de la collection ${collectionName}:`, error);
    throw error;
  }
}

export async function createDocument<T = DocumentData>(
  collectionName: string,
  data: T,
  documentId?: string
): Promise<string> {
  try {
    const docRef = documentId
      ? doc(db, collectionName, documentId)
      : doc(collection(db, collectionName));

    await setDoc(docRef, data as DocumentData);
    return docRef.id;
  } catch (error) {
    console.error(`Erreur lors de la création du document dans ${collectionName}:`, error);
    throw error;
  }
}

export async function updateDocument<T = Partial<DocumentData>>(
  collectionName: string,
  documentId: string,
  data: T
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, data as DocumentData);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du document ${collectionName}/${documentId}:`, error);
    throw error;
  }
}

export async function deleteDocument(
  collectionName: string,
  documentId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Erreur lors de la suppression du document ${collectionName}/${documentId}:`, error);
    throw error;
  }
}

export { where, orderBy, limit };

