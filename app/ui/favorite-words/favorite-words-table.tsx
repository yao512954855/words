import Image from 'next/image';
import { lusitana } from '@/app/ui/fonts';

interface FavoriteWord {
  id: string;
  word_text: string;
  favorite_count: number;
  image_url: string;
  created_at: string;
  last_favorited_at: string;
}

interface FavoriteWordsTableProps {
  favoriteWords: FavoriteWord[];
}

export default function FavoriteWordsTable({ favoriteWords }: FavoriteWordsTableProps) {
  if (favoriteWords.length === 0) {
    return (
      <div className="mt-6 flow-root">
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <div className="md:hidden">
              <div className="mb-2 w-full rounded-md bg-white p-4">
                <p className="text-center text-gray-500">暂无收藏单词记录</p>
              </div>
            </div>
            <table className="hidden min-w-full text-gray-900 md:table">
              <thead className="rounded-lg text-left text-sm font-normal">
                <tr>
                  <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                    单词
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    收藏次数
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    首次收藏时间
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    最后收藏时间
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                <tr>
                  <td colSpan={4} className="whitespace-nowrap px-6 py-8 text-center text-gray-500">
                    暂无收藏单词记录
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {favoriteWords?.map((favoriteWord) => (
              <div
                key={favoriteWord.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center">
                    <Image
                      src={favoriteWord.image_url}
                      className="mr-2 rounded-full"
                      width={28}
                      height={28}
                      alt={`${favoriteWord.word_text} picture`}
                    />
                    <p className="text-sm font-medium">{favoriteWord.word_text}</p>
                  </div>
                  <p className={`${lusitana.className} text-sm font-medium text-blue-600`}>
                    {favoriteWord.favorite_count} 次
                  </p>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xs text-gray-500">首次收藏:</p>
                    <p className="text-sm">
                      {new Date(favoriteWord.created_at).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">最后收藏:</p>
                    <p className="text-sm">
                      {new Date(favoriteWord.last_favorited_at).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  单词
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  收藏次数
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  首次收藏时间
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  最后收藏时间
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {favoriteWords?.map((favoriteWord) => (
                <tr
                  key={favoriteWord.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={favoriteWord.image_url}
                        className="rounded-full"
                        width={28}
                        height={28}
                        alt={`${favoriteWord.word_text} picture`}
                      />
                      <p className="font-medium">{favoriteWord.word_text}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <p className={`${lusitana.className} font-medium text-blue-600`}>
                      {favoriteWord.favorite_count} 次
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <p className="text-sm">
                      {new Date(favoriteWord.created_at).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <p className="text-sm">
                      {new Date(favoriteWord.last_favorited_at).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}