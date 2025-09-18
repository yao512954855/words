import Image from 'next/image';
import { lusitana } from '@/app/ui/fonts';

interface HintWord {
  id: string;
  word: string;
  hint_count: number;
  image_url: string;
  last_hint_at: string;
}

interface HintWordsTableProps {
  hintWords: HintWord[];
}

export default function HintWordsTable({ hintWords }: HintWordsTableProps) {
  if (hintWords.length === 0) {
    return (
      <div className="mt-6 flow-root">
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <div className="md:hidden">
              <div className="mb-2 w-full rounded-md bg-white p-4">
                <p className="text-center text-gray-500">暂无提示单词记录</p>
              </div>
            </div>
            <table className="hidden min-w-full text-gray-900 md:table">
              <thead className="rounded-lg text-left text-sm font-normal">
                <tr>
                  <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                    单词
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    提示次数
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    最后提示时间
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                <tr>
                  <td colSpan={3} className="whitespace-nowrap px-6 py-8 text-center text-gray-500">
                    暂无提示单词记录
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
            {hintWords?.map((hintWord) => (
              <div
                key={hintWord.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center">
                    <Image
                      src={hintWord.image_url}
                      className="mr-2 rounded-full"
                      width={28}
                      height={28}
                      alt={`${hintWord.word} picture`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/customers/default-avatar.png';
                      }}
                    />
                    <p className="text-sm font-medium">{hintWord.word}</p>
                  </div>
                  <p className={`${lusitana.className} text-sm text-gray-500`}>
                    {hintWord.hint_count} 次
                  </p>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium">
                      提示次数: {hintWord.hint_count}
                    </p>
                    <p className="text-sm text-gray-500">
                      最后提示: {new Date(hintWord.last_hint_at).toLocaleDateString('zh-CN')}
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
                  提示次数
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  最后提示时间
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {hintWords?.map((hintWord) => (
                <tr
                  key={hintWord.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={hintWord.image_url}
                        className="rounded-full"
                        width={28}
                        height={28}
                        alt={`${hintWord.word} picture`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/customers/default-avatar.png';
                        }}
                      />
                      <p className="font-medium">{hintWord.word}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                      {hintWord.hint_count} 次
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {new Date(hintWord.last_hint_at).toLocaleDateString('zh-CN')}
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