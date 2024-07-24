"use client";
import React, { ChangeEvent, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.BASE_URL}/api/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Signin successful!", { id: "signin_success" });
        console.log("Signin successful!", result);
        // Handle successful signin (e.g., redirect or save token)
      } else {
        handleError(result);
      }
    } catch (err: any) {
      toast.error(
        `Error submitting form: ${err.message || "An unknown error occurred"}`,
        { id: "error_while_signing_in" }
      );
      console.error("Error submitting form:", err.message);
    }
  };

  const handleError = (result: any) => {
    switch (result.code) {
      case "USER_NOT_FOUND":
        toast.error(`Error: ${result.message}`, { id: "signin_error" });
        break;
      case "INVALID_PASSWORD":
        toast.error(`Error: ${result.message}`, { id: "signin_error" });
        break;
      default:
        toast.error("An unknown error occurred", { id: "signin_error" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center text-gray-800">
          Sign In
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div>
            <label htmlFor="email" className="block text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">{"Don't have an account?"}</p>
          <Link href="/signup" className="text-blue-600 hover:underline">
            Go to signup page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
