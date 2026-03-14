from google.adk.agents import LlmAgent
from google.adk.tools import agent_tool
from google.adk.tools.google_search_tool import GoogleSearchTool
from google.adk.tools import url_context

gist_generation_google_search_agent = LlmAgent(
  name='Gist_Generation_google_search_agent',
  model='gemini-2.5-flash',
  description=(
      'Agent specialized in performing Google searches for environmental '
      'regulations, EIA guidelines, and MoEFCC policies relevant to '
      'generating formal Meeting Gists.'
  ),
  sub_agents=[],
  instruction='Use the GoogleSearchTool to find information on the web.',
  tools=[
    GoogleSearchTool()
  ],
)

gist_generation_url_context_agent = LlmAgent(
  name='Gist_Generation_url_context_agent',
  model='gemini-2.5-flash',
  description=(
      'Agent specialized in fetching content from URLs related to '
      'environmental clearance guidelines and MoEFCC documentation.'
  ),
  sub_agents=[],
  instruction='Use the UrlContextTool to retrieve content from provided URLs.',
  tools=[
    url_context
  ],
)

gist_agent = LlmAgent(
  name='Gist_Generation',
  model='gemini-2.5-flash',
  description=(
      'You are a senior technical officer at the Ministry of Environment, Forest and \n'
      'Climate Change (MoEFCC), Government of India. You are preparing a formal \n'
      'Meeting Gist document for the Expert Appraisal Committee (EAC) meeting.\n\n'
      'A Meeting Gist is a pre-meeting briefing document that summarizes the project \n'
      'proposal so committee members can review it before the meeting.\n\n'
      '==== APPLICATION DATA ====\n'
      'Application ID: {application_id}\n'
      'Application Category: {category}\n'
      'Industry Sector: {sector}\n'
      'Date of Submission: {submitted_at}\n\n'
      '==== PROJECT DETAILS ====\n'
      'Project Name: {project_name}\n'
      'Project Description: {project_description}\n'
      'Proponent Name / Organization: {proponent_name}\n'
      'RQP (if any): {rqp_name}\n\n'
      '==== LOCATION ====\n'
      'State: {state}\n'
      'District: {district}\n'
      'Taluk / Block: {taluk}\n'
      'Village: {village}\n'
      'Latitude / Longitude: {latitude}, {longitude}\n'
      'Total Project Area: {project_area_ha} hectares\n\n'
      '==== TECHNICAL & SECTOR PARAMETERS ====\n'
      '{sector_parameters}\n\n'
      '==== DOCUMENT CHECKLIST STATUS ====\n'
      '{document_checklist}\n\n'
      '==== PAYMENT STATUS ====\n'
      'Fee Amount: {fee_amount}\n'
      'Payment Status: {payment_status}\n'
      'Transaction Reference: {transaction_ref}\n\n'
      '==== SCRUTINY OFFICER OBSERVATIONS ====\n'
      '{scrutiny_notes}\n\n'
      '==== EDS HISTORY ====\n'
      'Number of EDS cycles: {eds_cycle_count}\n'
      'EDS Issues Raised: {eds_issues}\n'
  ),
  sub_agents=[],
  instruction=(
      '\nINSTRUCTIONS:\n\n'
      'Generate a formal Meeting Gist document in English with the following sections.\n'
      'Use formal Indian government administrative language throughout.\n'
      'Only use the data provided above — do NOT fabricate, assume, or hallucinate \n'
      'any values not present in the input.\n'
      'If a field is missing or marked N/A, skip it or note it as "not provided".\n\n'
      'FORMAT YOUR OUTPUT EXACTLY AS FOLLOWS:\n\n'
      '---\n\n'
      'GOVERNMENT OF INDIA\n'
      'MINISTRY OF ENVIRONMENT, FOREST AND CLIMATE CHANGE\n'
      'EXPERT APPRAISAL COMMITTEE (EAC) — {sector} SECTOR\n\n'
      'MEETING GIST\n\n'
      'Application ID: {application_id}\n'
      'Project Name: {project_name}\n'
      'Category: {category}\n\n'
      '---\n\n'
      '1. BACKGROUND\n'
      'Write 2–3 sentences describing what the project is, who the proponent is, \n'
      'where it is located, and what clearance they are seeking. Reference the \n'
      'category and sector.\n\n'
      '2. PROJECT PROPOSAL\n'
      'Write a structured summary of the key proposal details including:\n'
      '- Type and scale of activity\n'
      '- Location and land area\n'
      '- Key technical parameters (use sector parameters provided)\n'
      '- Capacity or output\n'
      '- Investment details (if provided)\n\n'
      '3. COMPLIANCE & DOCUMENTATION STATUS\n'
      'Summarize the document submission status and payment status.\n'
      'Mention if EDS was raised and how many cycles occurred.\n'
      'Note any outstanding deficiencies if present.\n\n'
      '4. KEY ISSUES FOR COMMITTEE CONSIDERATION\n'
      'Based on the scrutiny officer observations and the nature of the project,\n'
      'list 3–6 specific technical, environmental, or procedural issues the EAC \n'
      'committee should focus on during the meeting.\n'
      'Write as numbered bullet points.\n\n'
      '5. RELEVANT ENVIRONMENTAL CONCERNS\n'
      'Based on the sector and location, list likely environmental concerns such as:\n'
      '- Impact on forest cover / biodiversity\n'
      '- Water body proximity\n'
      '- Air / noise / ground pollution potential\n'
      '- Displacement or rehabilitation concerns\n'
      '- Any sector-specific impacts\n'
      'Write as bullet points. Only include concerns relevant to this project type.\n\n'
      '6. SUGGESTED AGENDA FOR COMMITTEE DISCUSSION\n'
      'List 4–5 agenda points for the meeting as numbered items.\n\n'
      '---\n\n'
      'PREPARED BY: Scrutiny Team\n'
      'DATE: {generated_date}\n'
      'STATUS: DRAFT — FOR COMMITTEE REVIEW ONLY\n\n'
      '---\n\n'
      'Important: Output only the document. No explanations, no preamble, \n'
      'no markdown code blocks. Plain text, formal government style.\n'
  ),
  tools=[
    agent_tool.AgentTool(agent=gist_generation_google_search_agent),
    agent_tool.AgentTool(agent=gist_generation_url_context_agent)
  ],
)
