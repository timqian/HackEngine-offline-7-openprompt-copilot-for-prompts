import { OpenAIStream, OpenAIStreamPayload } from "../../utils/OpenAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
  const { prompt } = (await req.json()) as {
    prompt?: string;
  };

  if (!prompt) {
    return new Response("No prompt in the request", { status: 400 });
  }

  const payload: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo",
    messages: [{ role:"system", content: `
According to the following guide about how to write better prompt, optimize the prompt I give you. Return the prompt, also tell me what have you optimized

    --------------------------------
    ### 2. Put instructions at the beginning of the prompt and use ### or """ to separate the instruction and context 
    Less effective ❌: 
    
    
    Summarize the text below as a bullet point list of the most important points.
    
    {text input here}
    """
    
    Better ✅:
    
    Summarize the text below as a bullet point list of the most important points.
    
    Text: """
    {text input here}
    """
     
    ### 3. Be specific, descriptive and as detailed as possible about the desired context, outcome, length, format, style, etc 
    Be specific about the context, outcome, length, format, style, etc 
    
    Less effective ❌:
    
    Write a poem about OpenAI. 
     
    Better ✅:
    
    Write a short inspiring poem about OpenAI, focusing on the recent DALL-E product launch (DALL-E is a text to image ML model) in the style of a {famous poet}
     
    
     
    
    ### 4. Articulate the desired output format through examples (example 1, example 2). 
    Less effective ❌:
    
    Extract the entities mentioned in the text below. Extract the following 4 entity types: company names, people names, specific topics and themes.
    
    Text: {text}
    Show, and tell - the models respond better when shown specific format requirements. This also makes it easier to programmatically parse out multiple outputs reliably.
    
     
    
    Better ✅:
    
    Extract the important entities mentioned in the text below. First extract all company names, then extract all people names, then extract specific topics which fit the content and finally extract general overarching themes
    
    Desired format:
    Company names: <comma_separated_list_of_company_names>
    People names: -||-
    Specific topics: -||-
    General themes: -||-
    
    Text: {text}
     
    
     
    
    ### 5. Start with zero-shot, then few-shot (example), neither of them worked, then fine-tune 
    ✅ Zero-shot 
    
    Extract keywords from the below text.
    
    Text: {text}
    
    Keywords:
     
    
    ✅ Few-shot - provide a couple of examples
    
    Extract keywords from the corresponding texts below.
    
    Text 1: Stripe provides APIs that web developers can use to integrate payment processing into their websites and mobile applications.
    Keywords 1: Stripe, payment processing, APIs, web developers, websites, mobile applications
    ##
    Text 2: OpenAI has trained cutting-edge language models that are very good at understanding and generating text. Our API provides access to these models and can be used to solve virtually any task that involves processing language.
    Keywords 2: OpenAI, language models, text processing, API.
    ##
    Text 3: {text}
    Keywords 3:
     
    
    ✅Fine-tune: see fine-tune best practices here.
    
     
    
     
    
    ### 6. Reduce “fluffy” and imprecise descriptions
    Less effective ❌:
    
    The description for this product should be fairly short, a few sentences only, and not too much more.
     
    
    Better ✅:
    
    Use a 3 to 5 sentence paragraph to describe this product.
     
    
     
    
    ### 7. Instead of just saying what not to do, say what to do instead
    Less effective ❌:
    
    The following is a conversation between an Agent and a Customer. DO NOT ASK USERNAME OR PASSWORD. DO NOT REPEAT.
    
    Customer: I can’t log in to my account.
    Agent:
     
    
    Better ✅:
    
    The following is a conversation between an Agent and a Customer. The agent will attempt to diagnose the problem and suggest a solution, whilst refraining from asking any questions related to PII. Instead of asking for PII, such as username or password, refer the user to the help article www.samplewebsite.com/help/faq
    
    Customer: I can’t log in to my account.
    Agent:
     
    
     
    
    ### 8. Code Generation Specific - Use “leading words” to nudge the model toward a particular pattern
    Less effective ❌:
    
    # Write a simple python function that
    # 1. Ask me for a number in mile
    # 2. It converts miles to kilometers
     
    
    In this code example below, adding “import” hints to the model that it should start writing in Python. (Similarly “SELECT” is a good hint for the start of a SQL statement.) 
    
     
    
    Better ✅:
    
    # Write a simple python function that
    # 1. Ask me for a number in mile
    # 2. It converts miles to kilometers
     
    import
    -------------------------------- 
    `}, {role: "user", content: `Original prompt: """
${prompt}
"""

Desired format:

Optimized Prompt:

<optimized_prompt>

What have been optimized:

<what have been optimized>
`}],
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 2000,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);
  return new Response(stream);
};

export default handler;
