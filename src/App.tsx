import { memo, useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
const URL = "https://jsonplaceholder.typicode.com/users";

type Company = {
  bs: string;
  catchPhrase: string;
  name: string;
};

type User = {
  id: number;
  email: string;
  name: string;
  phone: string;
  username: string;
  website: string;
  company: Company;
  address: any;
};

interface IButtonProps {
  onClick: any;
}

function Button({ onClick }: IButtonProps): JSX.Element {
  return (
    <button type="button" onClick={onClick}>
      get random user
    </button>
  );
}

interface IUserInfoProps {
  user: User;
}

function UserInfo({ user }: IUserInfoProps): JSX.Element {
  return (
    <table>
      <thead>
        <tr>
          <th>Username</th>
          <th>Phone number</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{user.name}</td>
          <td>{user.phone}</td>
        </tr>
      </tbody>
    </table>
  );
}

const UserInfoMemo = memo(UserInfo);

function ErrorInfo(): JSX.Element {
  return <div>No data</div>;
}

function useThrottle<T extends any[]>(fn: (...args: T) => any, wait = 0) {
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const fnRef = useRef(fn);
  const currentArgs = useRef<T>();

  fnRef.current = fn;

  const callback = useCallback(
    (...args: T) => {
      currentArgs.current = args;

      if (!timer.current) {
        timer.current = setTimeout(() => {
          fnRef.current(...(currentArgs.current as T));
          timer.current = undefined;
        }, wait);
      }
    },
    [wait]
  );

  return callback;
}

function App() {
  const [item, setItem] = useState<User>();
  const [isError, setIsError] = useState<boolean>(false);

  const receiveRandomUser = async () => {
    const id = Math.floor(Math.random() * (10 - 1)) + 1;
    try {
      setIsError(false);
      const response = await fetch(`${URL}/${id}`);
      const _user = (await response.json()) as User;
      setItem(_user);
    } catch (err) {
      setIsError(true);
      setItem(undefined);
    }
  };

  const receiveRandomUserThrottle = useThrottle(receiveRandomUser, 1000);

  const handleButtonClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    receiveRandomUserThrottle();
  };
  return (
    <div>
      <header>Get a random user</header>
      <Button onClick={handleButtonClick} />
      {item && <UserInfoMemo user={item} />}
      {isError && <ErrorInfo />}
    </div>
  );
}

export default App;
