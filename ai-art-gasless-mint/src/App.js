import {useEffect, useState} from 'react'
import axios from 'axios'
import { NFTStorage } from "nft.storage";
import loader from './assests/loader.svg'
function App() {
  const [prompt,setPrompt]= useState("")
  const [imageBlob, setImageBlob]= useState(null)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [minted, setMinted] = useState(false);



  const generateArt=async()=>{
    setLoading(true)
    try{
      const response=await axios.post("https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5"
      ,
    {  headers:{
        Authorization: `Bearer ${process.env.REACT_APP_HUGGING_FACE}}`,
      },
      method: "POST",
      inputs:prompt,

      },
      {
        responseType: "blob"
      }
      )
      const file = new File([response.data], "image.png", {
        type: "image/png",
      });
      setFile(file)
      const url= URL.createObjectURL(response.data)
      console.log(url)
      setImageBlob(url)
    
    }catch(error){
      console.log("Error",error)
      setError(true)
    }
    finally{
      setLoading(false)
    }
  }
  const cleanupIPFS = (url) => {
    if(url.includes("ipfs://")) {
      return url.replace("ipfs://", "https://ipfs.io/ipfs/")
    }
  }

const uploadArtToIpfs=async()=>{
try{
  const nftstorage= new NFTStorage({
    token: process.env.REACT_APP_NFT_STORAGE,
  })
  const store= await nftstorage.store({
    name:"AI NFT",
    description: "AI generated NFT",
    image: file
  })
  return cleanupIPFS(store.data.image.href)

}
  catch(error){
console.log("Error",error)
return null
  }
}
const mintNft = async () => {
  try {
setLoading(true)
    const imageURL = await uploadArtToIpfs();
    console.log("URL ", imageURL)
    // mint as an NFT on nftport
 
    const response = await axios.post(
      `https://api.nftport.xyz/v0/mints/easy/urls`,
      {
        file_url: imageURL,
        chain: "polygon",
        name: name?.length > 0 ? name : "AI NFT",
        description: description?.length > 0 ? description : "AI generated NFT",
        mint_to_address: address?.length > 0 ? address : "0x78f6F2Ed5023A5385E614773C7CEe174cB072d76",
      },
  
      {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          Authorization: process.env.REACT_APP_NFT_PORT,
        }
      }
    );
    const data = await response.data;
setLoading(false)
    setMinted(true)
    console.log(data);
  } catch (err) {
    console.log(err);
  }
};
useEffect(()=>{
setMinted(false)
},[file])


  return (

    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-emerald-900">
    <h1 className="text-4xl font-extrabold">AI Art Gasless mints</h1>
    <div className="flex flex-col items-center justify-center">
      {/* Create an input box and button saying next beside it */}
      <div className="flex items-center justify-center gap-4">
        <input
          className="border-2 border-black rounded-md p-2"
          onChange={(e) => setPrompt(e.target.value)}
          type="text"
          placeholder="Enter a prompt"
        />
        <button
          onClick={generateArt}
          className="bg-black text-white rounded-md p-2"
        >
          Next
        </button>
        {loading && (  <div className="fixed inset-0 z-10 h-screen bg-[rgba(0,0,0,0.7)] flex items-center justify-center flex-col">
      <img src={loader} alt="loader" className="w-[100px] h-[100px] object-contain"/>
     
    </div>)}
      </div>
      {imageBlob && (
        <div className="flex flex-col gap-4 items-center justify-center mt-4">
          <img src={imageBlob} alt="AI generated art" />
          {
            minted ? <p>Minted this NFT</p> : (
              <div className="flex flex-col items-center justify-center gap-4">
      {/* input for name */}
      <input
        className="border-2 border-black rounded-md p-2"
        onChange={(e) => setName(e.target.value)}
        type="text"
        placeholder="Enter a name"
      />
      {/* input for description */}
      <input
        className="border-2 border-black rounded-md p-2"
        onChange={(e) => setDescription(e.target.value)}
        type="text"
        placeholder="Enter a description"
      />
      {/* input for address */}
      <input
        className="border-2 border-black rounded-md p-2"
        onChange={(e) => setAddress(e.target.value)}
        type="text"
        placeholder="Enter a address"
      />
      {/* button to mint */}
      <button
        onClick={mintNft}
        className="bg-black text-white rounded-md p-2"
      >
        Mint
      </button>
    </div>
            )
          }
        </div>
      )}
      <div className='mt-4 uppercase'>
          <p className='font-bold'>Go to opensea.io to view your minted NFTS</p>
      </div>
    </div>
  </div>
  );
}

export default App;
