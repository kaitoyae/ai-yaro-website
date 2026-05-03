/**
 * メンバー各自のプロジェクト一覧。
 * この配列を編集して GitHub に Push / PR するとサイトに反映されます。
 */
export type MemberProject = {
  id: string;
  title: string;
  description: string;
  /** 担当・更新者の表示名 */
  member: string;
  /** 任意: リポジトリ・デモ・ドキュメントなど */
  url?: string;
  tags?: string[];
  /** 表示用の更新日 (YYYY-MM-DD など自由形式) */
  updatedAt: string;
};

export const memberProjects: MemberProject[] = [
  {
    id: 'example',
    title: 'サンプルプロジェクト',
    description:
      'このカードは例です。`src/data/memberProjects.ts` に自分のプロジェクトを追加するか、この項目を書き換えてください。',
    member: 'AI野郎 メンバー',
    url: 'https://github.com/',
    tags: ['Example'],
    updatedAt: '2026-05-03',
  },
];
