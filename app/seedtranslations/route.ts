import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!);

export async function GET() {
  try {
    // 删除旧表（如果存在）
    await sql`DROP TABLE IF EXISTS word_translations;`;
    
    // 创建新的翻译表
    await sql`
      CREATE TABLE word_translations (
        id SERIAL PRIMARY KEY,
        word_text VARCHAR(255) NOT NULL UNIQUE,
        chinese_translation VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 创建索引以提高查询性能
    await sql`
      CREATE INDEX idx_word_translations_word_text 
      ON word_translations(word_text);
    `;

    // 插入更多翻译数据
    const translations = [
      { word: 'apple', translation: '苹果' },
      { word: 'banana', translation: '香蕉' },
      { word: 'chocolate', translation: '巧克力' },
      { word: 'cat', translation: '猫' },
      { word: 'dog', translation: '狗' },
      { word: 'book', translation: '书' },
      { word: 'pen', translation: '笔' },
      { word: 'water', translation: '水' },
      { word: 'fire', translation: '火' },
      { word: 'earth', translation: '地球' },
      { word: 'sun', translation: '太阳' },
      { word: 'moon', translation: '月亮' },
      { word: 'star', translation: '星星' },
      { word: 'tree', translation: '树' },
      { word: 'flower', translation: '花' },
      { word: 'bird', translation: '鸟' },
      { word: 'fish', translation: '鱼' },
      { word: 'house', translation: '房子' },
      { word: 'car', translation: '汽车' },
      { word: 'school', translation: '学校' },
      { word: 'teacher', translation: '老师' },
      { word: 'student', translation: '学生' },
      { word: 'friend', translation: '朋友' },
      { word: 'family', translation: '家庭' },
      { word: 'love', translation: '爱' },
      { word: 'happy', translation: '快乐的' },
      { word: 'sad', translation: '悲伤的' },
      { word: 'good', translation: '好的' },
      { word: 'bad', translation: '坏的' },
      { word: 'big', translation: '大的' },
      { word: 'small', translation: '小的' },
      { word: 'red', translation: '红色' },
      { word: 'blue', translation: '蓝色' },
      { word: 'green', translation: '绿色' },
      { word: 'yellow', translation: '黄色' },
      { word: 'black', translation: '黑色' },
      { word: 'white', translation: '白色' },
      { word: 'one', translation: '一' },
      { word: 'two', translation: '二' },
      { word: 'three', translation: '三' },
      { word: 'four', translation: '四' },
      { word: 'five', translation: '五' },
      { word: 'six', translation: '六' },
      { word: 'seven', translation: '七' },
      { word: 'eight', translation: '八' },
      { word: 'nine', translation: '九' },
      { word: 'ten', translation: '十' },
      { word: 'hello', translation: '你好' },
      { word: 'goodbye', translation: '再见' },
      { word: 'thank', translation: '谢谢' },
      { word: 'please', translation: '请' },
      { word: 'sorry', translation: '对不起' },
      { word: 'yes', translation: '是' },
      { word: 'no', translation: '不' },
      { word: 'eat', translation: '吃' },
      { word: 'drink', translation: '喝' },
      { word: 'sleep', translation: '睡觉' },
      { word: 'run', translation: '跑' },
      { word: 'walk', translation: '走' },
      { word: 'read', translation: '读' },
      { word: 'write', translation: '写' },
      { word: 'listen', translation: '听' },
      { word: 'speak', translation: '说' },
      { word: 'see', translation: '看见' },
      { word: 'hear', translation: '听见' },
      { word: 'feel', translation: '感觉' },
      { word: 'think', translation: '思考' },
      { word: 'know', translation: '知道' },
      { word: 'learn', translation: '学习' },
      { word: 'teach', translation: '教' },
      { word: 'work', translation: '工作' },
      { word: 'play', translation: '玩' },
      { word: 'study', translation: '学习' },
      { word: 'home', translation: '家' },
      { word: 'time', translation: '时间' },
      { word: 'day', translation: '天' },
      { word: 'night', translation: '夜晚' },
      { word: 'morning', translation: '早晨' },
      { word: 'afternoon', translation: '下午' },
      { word: 'evening', translation: '晚上' },
      { word: 'today', translation: '今天' },
      { word: 'tomorrow', translation: '明天' },
      { word: 'yesterday', translation: '昨天' },
    ];

    for (const { word, translation } of translations) {
      await sql`
        INSERT INTO word_translations (word_text, chinese_translation)
        VALUES (${word}, ${translation})
        ON CONFLICT (word_text) DO UPDATE SET
          chinese_translation = EXCLUDED.chinese_translation,
          updated_at = CURRENT_TIMESTAMP;
      `;
    }

    return Response.json({ 
      message: 'Word translations table created and seeded successfully',
      count: translations.length 
    });
  } catch (error) {
    console.error('Error seeding translations:', error);
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
}