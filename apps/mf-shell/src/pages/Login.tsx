import { useNavigate } from "react-router-dom"
import { Button } from "@design-system/atoms/Button/Button"

export default function Login() {
  const navigate = useNavigate()
  const login = async () => {
    const res = await fetch("/mocks/login.json")
    const data = await res.json()
    if (data.success) {
      navigate("/home")
    }
  }
  return (
    <div style={{ padding: "40px" }}>
      <h1>Jarvis MF Platform</h1>
      <Button
        label="Login"
        onClick={login}
      />
    </div>
  )
}