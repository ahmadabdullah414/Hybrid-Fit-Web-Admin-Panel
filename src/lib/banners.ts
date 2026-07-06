import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import type { HomeBanner } from "./types";

const HOME_BANNERS_COLLECTION = "home_banners";

// The Flutter app writes `createdAt` as a plain epoch-millis number
// (DateTime.now().millisecondsSinceEpoch), not a Firestore Timestamp — this
// must read/write the same shape so both platforms agree on ordering.
function bannerFromDoc(d: QueryDocumentSnapshot<DocumentData>): HomeBanner {
  const data = d.data();
  return {
    id: d.id,
    title: (data.title as string) ?? "Untitled banner",
    imageUrl: (data.imageUrl as string) ?? "",
    linkUrl: (data.linkUrl as string) ?? null,
    createdAt: new Date((data.createdAt as number) ?? 0),
  };
}

export function subscribeBanners(callback: (banners: HomeBanner[]) => void): () => void {
  const q = query(collection(db, HOME_BANNERS_COLLECTION), orderBy("createdAt"));
  return onSnapshot(q, (snap) => callback(snap.docs.map(bannerFromDoc)));
}

export async function addBanner(input: { title: string; imageUrl: string; linkUrl: string | null }): Promise<void> {
  await addDoc(collection(db, HOME_BANNERS_COLLECTION), {
    title: input.title,
    imageUrl: input.imageUrl,
    linkUrl: input.linkUrl,
    createdAt: Date.now(),
  });
}

export async function updateBanner(
  id: string,
  input: { title: string; imageUrl: string; linkUrl: string | null },
): Promise<void> {
  await updateDoc(doc(db, HOME_BANNERS_COLLECTION, id), {
    title: input.title,
    imageUrl: input.imageUrl,
    linkUrl: input.linkUrl,
  });
}

export async function deleteBanner(id: string): Promise<void> {
  await deleteDoc(doc(db, HOME_BANNERS_COLLECTION, id));
}
