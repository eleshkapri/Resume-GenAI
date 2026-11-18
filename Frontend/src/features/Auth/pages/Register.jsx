import React, { useState } from 'react'
import { useNavigate,Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'

const Register = () => {

    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const { loading, handleRegister } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        try {
            await handleRegister({ username, email, password })
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.")
        }
    }

    if(loading){
        return (<main><h1>Loading...</h1></main>)
    }


  return (
    <main>
      <div className="form-container">
        <h1>Register</h1>

        {error && <p style={{ color: "#ef4444", marginBottom: "1rem", fontSize: "0.9rem" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              id="username"
              name="username"
              placeholder="Enter Username"
            />
            </div>

            <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              id="email"
              name="email"
              placeholder="Enter Email Address"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              id="password"
              name="password"
              placeholder="Enter Password"
            />
          </div>

          <button className="button primary-button">Register</button>
        </form>

        <p>
          Already have an account?{" "}
            <Link to={"/login"} className="link">
              Login here
            </Link>
        </p>

      </div>
    </main>
  );
}

export default Register