import 'dotenv/config'
import readline from 'node:readline'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Make a call to get new message
const newMessage = async (history, message) => {
  const chatCompletion = await openai.chat.completions.create({
    messages: [...history, message],
    model: 'gpt-3.5-turbo',
  })

  return chatCompletion.choices[0].message
}

// Format message 
const formatMessage = (userInput) => ({ role: 'user', content: userInput })

// Recursion for main chat function 
const chat = () => {
  const history = [
    {
      role: 'system',
      content: `You are a helpful AI assistant. Answer the user's questions to the best of you ability.`,
    },
  ]
      
  const start = () => { 
    // prompt questions in terminal 
    rl.question('You: ', async (userInput) => {
      if (userInput.toLowerCase() === 'exit') {
        rl.close()
        return
      }

      const userMessage = formatMessage(userInput)
      const response = await newMessage(history, userMessage)

      history.push(userMessage, response)
      console.log(`\n\nAI: ${response.content}\n\n`)
      start()
    })
  }

  start()
  console.log('\n\nAI: How can I help you today?\n\n')
}

console.log("Chatbot initialized. Type 'exit' to end the chat.")
chat()