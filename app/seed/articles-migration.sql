-- 创建文章表
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  english_content TEXT NOT NULL,
  chinese_content TEXT NOT NULL,
  style VARCHAR(50) NOT NULL,
  difficulty VARCHAR(50) NOT NULL,
  version VARCHAR(50),
  grade VARCHAR(50),
  theclass VARCHAR(50),
  theunit VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- 创建文章单词表
CREATE TABLE IF NOT EXISTS article_words (
  id SERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  word VARCHAR(255) NOT NULL,
  phonetic VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_articles_user_id ON articles(user_id);
CREATE INDEX IF NOT EXISTS idx_article_words_article_id ON article_words(article_id);