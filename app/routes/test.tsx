import { ActionFunction, data, Form, useActionData } from "react-router";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name");

  if (typeof name !== "string" || name.length === 0) {
    return data({ error: "Name is required" }, { status: 400 });
  }

  const nameElem = <button>name</button>;

  return data({ nameElem });
};

export default function TestPage() {
  const actionData = useActionData();
  const isError = !!actionData?.error;

  console.log(actionData?.nameElem);

  return (
    <div>
      <h1>Test Page</h1>
      <Form method="post">
        <div>
          <label>
            Name: <input type="text" name="name" />
          </label>
        </div>
        {isError && <p style={{ color: "red" }}>{actionData.error}</p>}
        <div>
          <button type="submit">Submit</button>
        </div>

        <div style={{ border: "1px solid" }}>{actionData?.nameElem}</div>
      </Form>
    </div>
  );
}
