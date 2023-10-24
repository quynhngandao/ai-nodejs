// Document QA
import 'dotenv/config'
import { openai } from './openai.js'
import { Document } from 'langchain/document'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { CharacterTextSplitter } from 'langchain/text_splitter'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { YoutubeLoader } from 'langchain/document_loaders/web/youtube'

const question = process.argv[2] || 'hi'
const video = `https://youtu.be/zR_iuq2evXo?si=cG8rODgRgXOx9_Cn`

// Create vector store function
const createStore = () =>
  MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings())

// Takes a YouTube video URL, loads its content, and splits it into manageable chunks
export const docsFromYTVideo = async (video) => {
  const loader = YoutubeLoader.createFromUrl(video, {
    language: 'en',
    addVideoInfo: true,
  })
  return loader.loadAndSplit(
    new CharacterTextSplitter({
      separator: ' ',
      chunkSize: 2500,
      chunkOverlap: 100,
    })
  )
}

// Loads content from a PDF file and splits it into chunks
export const docsFromPDF = () => {
  const loader = new PDFLoader('xbox.pdf')
  return loader.loadAndSplit(
    new CharacterTextSplitter({
      separator: '. ',
      chunkSize: 2500,
      chunkOverlap: 200,
    })
  )
}

// Combines the chunks from the YouTube video and the PDF, creating a combined memory vector store
const loadStore = async () => {
  const videoDocs = await docsFromYTVideo(video)
  const pdfDocs = await docsFromPDF()

  return createStore([...videoDocs, ...pdfDocs])
}

// Query function
const query = async () => {
  // It loads the combined memory vector store
  const store = await loadStore()
  // Performs a semantic similarity search on the store using the provided `question`.
  const results = await store.similaritySearch(question, 2)

  // Sends the search results to OpenAI's GPT-3.5 Turbo model to generate an answer.
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-16k-0613',
    // factual setting
    temperature: 0,
    messages: [
      {
        role: 'assistant',
        content:
          'You are a helpful AI assistant. Answer questions to your best ability.',
      },

      {
        role: 'user',
        content: `Answer the following question using the provided context. If you cannot answer the question with the context, don't lie and make up stuff. Just say you need more context.
          Question: ${question}
    
          Context: ${results.map((r) => r.pageContent).join('\n')}`,
      },
    ],
  })

  // Prints out the AI's answer along with the sources (either from the YouTube video or the PDF).
  console.log(
    `Answer: ${response.choices[0].message.content}\n\nSources: ${results
      .map((r) => r.metadata.source)
      .join(', ')}`
  )
}
