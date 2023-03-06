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
    <Box className="px-3 h-full mb-4 flex flex-col justify-between">
      <Box className="max-h-full overflow-y-scroll box-border flex flex-col">
        {messages.map((message, index) => (
          <ChatMessagePill key={index} message={message} />
        ))}
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <div>
          <TextField
            {...formik.getFieldProps("message")}
            fullWidth
            autoComplete="false"
            placeholder="Write a message"
            autoFocus
            size="small"
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
                  <Icon icon="carbon:send" />
                </IconButton>
              ),
            }}
          />
        </div>
      </form>
    </Box>
  );
};
