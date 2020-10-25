/** @jsx jsx */
import { jsx } from "@emotion/core";

import { Button } from "@material/react-button";
import MaterialIcon from "@material/react-material-icon";
import TextField, { Input } from "@material/react-text-field";
import { FormEvent, useState } from "react";
import { useHistory } from "react-router-dom";
import { ErrorMessage } from "../../components/lib";
import client from "../../network/client";
import NavbarPageTemplate from "../../screens/templates/navbar-page";
import useAsync from "../../utils/use-async";

function CandidateHome() {
  const [examCode, setExamCode] = useState("");
  const [examCodeErrors, setExamCodeErrors] = useState<string[]>([]);
  const { run, isLoading } = useAsync();
  const history = useHistory();

  async function handleClickJoin() {
    try {
      await run(client("check_code", { params: { code: examCode } }));
      history.push(`exam/${examCode}`);
    } catch (error) {
      setExamCodeErrors(error.fields?.code ?? [])
    }
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
