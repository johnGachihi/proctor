/** @jsx jsx */
import { jsx } from "@emotion/core";
import { Button } from "@material/react-button";
import TextField, { Input } from "@material/react-text-field";
import { Caption, Headline5 } from "@material/react-typography";
import styled from "@emotion/styled";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "./contexts/auth-context";
import useAsync from "./utils/use-async";

function UnauthenticatedApp() {
  const {
    username,
    usernameError,
    password,
    passwordError,
    handleUsernameChange,
    handlePasswordChange,
    handleSubmit: _handleSubmit,
  } = useForm();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    _handleSubmit();
  };

  return (
    <div
      css={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Headline5>Login</Headline5>
      <form
        css={{
          display: "flex",
          flexDirection: "column",
        }}
        onSubmit={handleSubmit}
      >
        <FormGroup>
          <TextField label="Username">
            <Input value={username} onChange={handleUsernameChange} />
          </TextField>
          {usernameError.map((error, idx) => (
            <ErrorMessage key={idx}>{error}</ErrorMessage>
          ))}
        </FormGroup>

        <FormGroup>
          <TextField label="Password">
            <Input
              value={password}
              type="password"
              onChange={handlePasswordChange}
            />
          </TextField>
          {passwordError.map((error, idx) => (
            <ErrorMessage key={idx}>{error}</ErrorMessage>
          ))}
        </FormGroup>

        <Button raised>Log in</Button>
      </form>
    </div>
  );
}

/* TODO: 'username' to 'email' */
const useForm = () => {
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState([]);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState([]);
  const { run, isError, error } = useAsync();
  const { login } = useAuth();

  useEffect(() => {
    if (isError && error.fields) {
      setUsernameError(error.fields.email ?? []);
      setPasswordError(error.fields.password ?? []);
    }
  }, [isError, error]);

  const handleUsernameChange = (e: FormEvent<HTMLInputElement>) => {
    setUsername(e.currentTarget.value);
  };
  const handlePasswordChange = (e: FormEvent<HTMLInputElement>) => {
    setPassword(e.currentTarget.value);
  };

  const handleSubmit = () => {
    run(login({ email: username, password }));
  };

  /* TODO: on*** or handle*** */
  return {
    username,
    usernameError,
    password,
    passwordError,
    handleUsernameChange: handleUsernameChange,
    handlePasswordChange: handlePasswordChange,
    handleSubmit: handleSubmit,
  };
};

const FormGroup = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
`;

const ErrorMessage = styled(Caption)`
  color: red;
  margin-left: 7px;
`;

export default UnauthenticatedApp;
