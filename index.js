import 'dotenv/config'
import OpenAI from 'openai'
const openai = new OpenAI()

const results = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  message: [
    {
      role: 'system',
      content:
        'You are an AI assistant, answer any questions to best of your ability.',
    },
    {
      role: 'user',
      content: 'Hi! my name is Quynh',
    },
  ],
})

console.log(results.choices[0].message.content)
