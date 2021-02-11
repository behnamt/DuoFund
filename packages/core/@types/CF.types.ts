export interface ICFStoring {
  description: string;
  icon: string;
  image: string;
  primaryColor: string;
  secondaryColor: string;
  expiryDate: number;
  etherTarget: string;
  etherPerToken: string;
}

export interface ICFStored extends Omit<ICFStoring, "etherPerToken" | "etherTarget"> {
  id: string;
  creator: string;
  creationDate: number;
  weiPerToken: string;
  target: string;
}