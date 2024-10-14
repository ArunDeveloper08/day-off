import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { Button } from "@/components/ui/button";
import { BASE_URL_OVERALL } from "../lib/constants";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import axios from "axios";

const Sop = () => {
  const [values, setValues] = useState({
    tradeIndex: "1",
  });
  const [editorContent, setEditorContent] = useState(null);
  const [initialContent, setInitialContent] = useState(null);

  const editor = useCreateBlockNote({
    initialContent: editorContent ,
    onContentChange: (content) => setEditorContent(content),
  },[initialContent]);

  


  

  const handleSelect = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const dataToSend = {
      editorContent: editor.topLevelBlocks,
    };
    try {
      const response = await axios.post(
        `${BASE_URL_OVERALL}/sop/edit?tradeIndex=${values?.tradeIndex || ""}`,
        dataToSend
      );

      alert(response?.data?.message);
    } catch (error) {
      console.error("Submission failed:", error.message);
    }
  };
  

  const fetchContentFromAPI = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL_OVERALL}/sop/get?tradeIndex=${values?.tradeIndex || "1"}`
      );
      const apiContent = JSON.parse(response?.data?.data[0]?.editorContent);

      setEditorContent(apiContent);
      setInitialContent(apiContent);
    } catch (error) {
      setEditorContent(null);
      console.error("Failed to fetch data from API:", error.message);
    }
  };
  
  useEffect(() => {      
    fetchContentFromAPI();
  }, [values.tradeIndex]);
  
 
  return (
    <>
      <div className="px-1 m-2">
        <Label>Trade Index</Label>
        <Select
          value={values.tradeIndex}
          name="terminal"
          onValueChange={(value) => handleSelect("tradeIndex", value)}
        >
          <SelectTrigger className="w-[300px] mt-1 border-zinc-500">
            <SelectValue>{values.tradeIndex}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Trade Index</SelectLabel>
              {[1, 2, 3, 4, 5, 6, 7,8,9,10,11,12,13,14,15,16,17,18,19,20].map((suggestion) => (
                <SelectItem key={suggestion} value={suggestion}>
                  {suggestion}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {editor && <BlockNoteView editor={editor} theme={"system"} />}
      <div className="mt-5">
        <Button onClick={handleSubmit} className="mt-5">
          Submit
        </Button>
      </div>
    </>
  );
};

export default Sop;
 