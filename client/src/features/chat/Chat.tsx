import { Icon } from "@iconify/react";
import { Box, IconButton, TextField } from "@mui/material";
import { FormikProps } from "formik";
import { ChatMessagePill } from "./ChatMessagePill";
import { MessageDetailsType } from "./ChatType";

export const Chat = (props: {
  formik: FormikProps<{
    message: string;
  }>;
  messages: MessageDetailsType[];
}) => {
  const { messages, formik } = props;

  return (
    <Box className="max-h-[calc(100vh-100px)] mx-4 my-0 flex flex-col box-border">
      <Box className="max-h-full overflow-scroll box-border flex flex-col">
        {messages.map((message, index) => (
          <ChatMessagePill key={index} message={message} />
        ))}
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <TextField
          {...formik.getFieldProps("message")}
          fullWidth
          placeholder="type here"
          autoFocus
          multiline
          minRows={1}
          className="chatInput-variant"
          InputProps={{
            sx: [{ color: "common.white" }],
           
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
