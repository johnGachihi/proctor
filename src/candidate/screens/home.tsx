/** @jsx jsx */
import { jsx } from "@emotion/core";

import { Button } from "@material/react-button";
import MaterialIcon from "@material/react-material-icon";
import TextField, { Input } from "@material/react-text-field";
import { FormEvent, PropsWithChildren, useState } from "react";
import { useHistory } from "react-router-dom";
import { ErrorMessage } from "../../components/lib";
import client from "../../network/client";
import NavbarPageTemplate from "../../screens/templates/navbar-page";
import useAsync from "../../utils/use-async";

type Props = PropsWithChildren<{
  setWebcamStream: (stream: MediaStream) => void
}>

function CandidateHome({ setWebcamStream }: Props) {
  const [examCode, setExamCode] = useState("");
  const [examCodeErrors, setExamCodeErrors] = useState<string[]>([]);
  const { run, isLoading } = useAsync();
  const history = useHistory();

  async function handleClickJoin() {
    try {
      await run(client('check_code', { params: { code: examCode } }))
      await getWebcamStream()
      history.push(`exam/${examCode}`);
    } catch (error) {
      console.error(error)
      setExamCodeErrors(error.fields?.code ?? [])

      if (error.name === "NotFoundError") {
        console.log('Please turn on your webcam')
      } else if (error.name === "NotAllowedError") {
        console.log('Please grant webcam permissions on your browser')
      }
    }
  }

  async function getWebcamStream() {
    const stream = await run(navigator.mediaDevices.getUserMedia({ video: true }))
    setWebcamStream(stream)
  }

  return (
    <NavbarPageTemplate loading={isLoading}>
      <div
        css={{
          height: "90vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          css={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <TextField
            outlined
            label="Enter exam code"
            leadingIcon={<MaterialIcon icon="keyboard" />}
          >
            <Input
              value={examCode}
              onChange={(e: FormEvent<HTMLInputElement>) => {
                setExamCode(e.currentTarget.value);
              }}
            />
          </TextField>

          {examCodeErrors.map((error, key) => 
            (<ErrorMessage key={key} children={error} css={{alignSelf: 'start'}}/>))}

          <Button disabled={examCode === ""} onClick={handleClickJoin}>
            Join
          </Button>
        </div>
      </div>
    </NavbarPageTemplate>
  );
}

export default CandidateHome;
