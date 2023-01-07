import { Icon } from "@iconify/react";
import { Box, IconButton, TextField } from "@mui/material";
import React, { useRef, useState } from "react";
import { ChatMessagePill } from "./ChatMessagePill";
import { MessageDetailsType } from "./ChatType";
import { useFormik } from "formik";
import * as yup from "yup";

export const Chat = () => {
  const [messages, setMessages] = useState<MessageDetailsType[]>([]);

  const formik = useFormik({
    initialValues: {
      message: "",
    },
    enableReinitialize: true,
    validationSchema: yup.object({
      message: yup.string().required().trim(),
    }),
    onSubmit: (values, { resetForm }) => {
      setMessages([
        ...messages,
        {
          message: values.message,
          senderDetails: {
            userName: "samankwe",
            ID: Math.random().toString(),
          },
        },
      ]);
      resetForm();
    },
  });

  return (
    <Box className="max-h-full mx-4 my-0 flex flex-col box-border">
      <Box className="max-h-[83%] overflow-scroll box-border mb-2 ">
        {messages.map((message) => (
          <ChatMessagePill message={message} />
        ))}
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <TextField
          {...formik.getFieldProps("message")}
          fullWidth
          placeholder="type here"
          autoFocus
          className="self-end flex rounded-18xl"
          InputProps={{
            endAdornment: (
              <IconButton
                type="submit"
                disabled={
                  formik.touched.message && Boolean(formik.errors.message)
                }
              >
                <Icon icon="carbon:send" fontSize={30} />
              </IconButton>
            ),
          }}
        />
      </form>
    </Box>
  );
};
