/** @jsx jsx */
import { jsx } from "@emotion/core";
import { Button } from "@material/react-button";
import TextField, { Input } from "@material/react-text-field";
import { Headline5 } from "@material/react-typography";
import styled from "@emotion/styled";
import { FormEvent, useState } from "react";
import { useAuth } from "./contexts/auth-context";
import useAsync from "./utils/use-async";
import { ErrorMessage } from "./components/lib";

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
            <Input 
              id='username'
              value={username}
              onChange={handleUsernameChange}
            />
          </TextField>
          {usernameError.map((error, idx) => (
            <ErrorMessage key={idx} role='alert'>{error}</ErrorMessage>
          ))}
        </FormGroup>

        <FormGroup>
          <TextField label="Password">
            <Input
              id='password'
              value={password}
              type="password"
              onChange={handlePasswordChange}
            />
          </TextField>
          {passwordError.map((error, idx) => (
            <ErrorMessage key={idx} role='alert'>{error}</ErrorMessage>
          ))}
        </FormGroup>

        <Button raised>Log in</Button>
      </form>
    </div>
  );
}


const useForm = () => {
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState([]);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState([]);
  const { run } = useAsync();
  const { login } = useAuth();

  const handleUsernameChange = (e: FormEvent<HTMLInputElement>) => {
    setUsername(e.currentTarget.value);
  };
  const handlePasswordChange = (e: FormEvent<HTMLInputElement>) => {
    setPassword(e.currentTarget.value);
  };

  const handleSubmit = async () => {
    try {
      await run(login({ email: username, password }));
    } catch (error) {
      if (error.fields) {
        setUsernameError(error.fields.email ?? []);
        setPasswordError(error.fields.password ?? []);
      }
    }
  };

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

export default UnauthenticatedApp;
