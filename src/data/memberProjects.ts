/**
 * メンバー各自のプロジェクト一覧。
 * この配列を編集して GitHub に Push / PR するとサイトに反映されます。
 */
export type ISODateString = `${number}-${number}-${number}`;

export type MemberProject = {
  id: string;
  title: string;
  description: string;
  /** 担当・更新者の表示名 */
  member: string;
  /** 任意: リポジトリ・デモ・ドキュメントなど */
  url?: string;
  tags?: string[];
  /** 表示用の更新日 (YYYY-MM-DD) */
  updatedAt: ISODateString;
};

export const memberProjects: MemberProject[] = [];
