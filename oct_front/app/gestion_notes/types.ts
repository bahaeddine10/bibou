export interface FormData {
  annee: string;
  noteAnn: string;
  noteAnnTr1: string;
  noteAnnTr2: string;
  noteAnnTr3: string;
  noteAnnTr4: string;
}

export interface SetNoteCarriereResponse {
  SetNoteCarriere: {
    Status: boolean;
    Message: string;
  };
} 