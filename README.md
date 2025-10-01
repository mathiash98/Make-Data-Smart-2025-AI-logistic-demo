# Make Data Smart 2025 - AI Agent test setup

## Mathias Haugsbø

CTO and Co-founder of DigiHome AS and DigiSale AS
https://digihome.no/

https://www.linkedin.com/in/mathias-haugsbo/

Likes to automate processes and reduce manual work.

## Setup:

1. Create supabase project and get the URL and anon key
2. Insert the supabase-schema.sql into your supabase database using the SQL editor
3. Create a n8n user and setup a workflow
4. Paste n8n-workflow.json into your n8n instance
5. Setup the n8n integrations with supabase and LLM provider (OpenRouter)

6. Update the .env file with your webhook URL, supabase URL and anon key.
   - SupabaseUrl is found on "API Docs" page in your supabase project
   - SupabaseKey is found on "API Docs" page in your supabase project
7. Activate the n8n workflow
8. Run `npm install`
9. Run `npm start`
10. Start chatting!

## Frontend

- Vite
- React
- Tanstack
- Shadcn/ui
- Supabase
