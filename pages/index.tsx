import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import DropDown, { VibeType } from "../components/DropDown";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LoadingDots from "../components/LoadingDots";

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState("");
  const [vibe, setVibe] = useState<VibeType>("Professional");
  const [generatedBios, setGeneratedBios] = useState<String>("");

  const bioRef = useRef<null | HTMLDivElement>(null);

  const scrollToBios = () => {
    if (bioRef.current !== null) {
      bioRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const prompt = `Generate 2 ${vibe} polished prompts according to the following guide:

--------------
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

  
-------------

Initial Prompt: {${bio}}
  }`;

  const generateBio = async (e: any) => {
    e.preventDefault();
    setGeneratedBios("");
    setLoading(true);
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setGeneratedBios((prev) => prev + chunkValue);
    }
    scrollToBios();
    setLoading(false);
  };

  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Head>
        <title>Copilot for prompts</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
        <h1 className="sm:text-5xl text-4xl max-w-[708px] font-bold text-slate-900">
          Optimize your prompt
        </h1>
        <span className="sm:text-4xl text-3xl text-slate-600 font-light py-4">
          according to OpenAI's best practices.
        </span>
        {/* <p className="text-slate-500 mt-5">47,118 bios generated so far.</p> */}
        <div className="max-w-xl w-full">
          <div className="flex mt-10 items-center space-x-3">
            {/* <Image
              src="/1-black.png"
              width={30}
              height={30}
              alt="1 icon"
              className="mb-5 sm:mb-0"
            /> */}
            <p className="text-left font-medium">
              Current prompt
            </p>
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5"
            placeholder={
              "e.g. Write a poem about OpenAI. "
            }
          />
          {/* <div className="flex mb-5 items-center space-x-3">
            <Image src="/2-black.png" width={30} height={30} alt="1 icon" />
            <p className="text-left font-medium">Select your vibe.</p>
          </div>
          <div className="block">
            <DropDown vibe={vibe} setVibe={(newVibe) => setVibe(newVibe)} />
          </div> */}

          {!loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              onClick={(e) => generateBio(e)}
            >
              Generate better prompts &rarr;
            </button>
          )}
          {loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              disabled
            >
              <LoadingDots color="white" style="large" />
            </button>
          )}
        </div>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
        <div className="space-y-10 my-10">
          {generatedBios && (
            <>
              <div>
                <h2
                  className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto"
                  ref={bioRef}
                >
                  Your generated bios
                </h2>
              </div>
              <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto">
                {generatedBios
                  .substring(generatedBios.indexOf("1") + 3)
                  .split("2.")
                  .map((generatedBio) => {
                    return (
                      <div
                        className="bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-copy border"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedBio);
                          toast("Bio copied to clipboard", {
                            icon: "✂️",
                          });
                        }}
                        key={generatedBio}
                      >
                        <p>{generatedBio}</p>
                      </div>
                    );
                  })}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
