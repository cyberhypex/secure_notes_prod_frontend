import React, { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { Blocks } from "react-loader-spinner";
import QuillEditor from "../QuillEditor";
import moment from "moment";
import { DataGrid } from "@mui/x-data-grid";
import Buttons from "../../utils/Buttons";
import Errors from "../Errors";
import toast from "react-hot-toast";
import Modals from "../PopModal";
import { auditLogscolumn } from "../../utils/tableColumn";

const NoteDetails = () => {
  const { id } = useParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [note, setNote] = useState(null);
  const [editorContent, setEditorContent] = useState("");
  const [auditLogs, setAuditLogs] = useState([]);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noteEditLoader, setNoteEditLoader] = useState(false);
  const [editEnable, setEditEnable] = useState(false);
  const navigate = useNavigate();
  const quillRef = useRef(null);

  const fetchNoteDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/notes");
      const foundNote = response.data.find((n) => n.id.toString() === id);
      if (foundNote) {
        foundNote.parsedContent = JSON.parse(foundNote.content).content;
        setNote(foundNote);
        setEditorContent(foundNote.parsedContent);
      } else {
        setError("Invalid Note");
      }
    } catch (err) {
      setError(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const checkAdminRole = async () => {
    try {
      const response = await api.get("/auth/user");
      const roles = response.data.roles;
      if (roles.includes("ROLE_ADMIN")) {
        setIsAdmin(true);
      }
    } catch (err) {
      setError("Error checking admin role");
    }
  };

  const fetchAuditLogs = useCallback(async () => {
    try {
      const response = await api.get(`/audit/note/${id}`);
      setAuditLogs(response.data);
    } catch (err) {
      setError("Error fetching audit logs");
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchNoteDetails();
      checkAdminRole();
      if (isAdmin) fetchAuditLogs();
    }
  }, [id, isAdmin, fetchAuditLogs, fetchNoteDetails]);

  const rows = auditLogs.map((item) => ({
    id: item.id,
    noteId: item.noteId,
    actions: item.action,
    username: item.username,
    timestamp: moment(item.timestamp).format("MMMM DD, YYYY, hh:mm A"),
    noteid: item.noteId,
    note: item.noteContent,
  }));

  if (error) return <Errors message={error} />;

  const onNoteEditHandler = async () => {
    if (editorContent.trim().length === 0) {
      return toast.error("Note content shouldn't be empty");
    }
    try {
      setNoteEditLoader(true);
      await api.put(`/notes/${id}`, { content: editorContent });
      toast.success("Note update successful");
      setEditEnable(false);
      fetchNoteDetails();
      checkAdminRole();
      if (isAdmin) fetchAuditLogs();
    } catch (err) {
      toast.error("Update Note Failed");
    } finally {
      setNoteEditLoader(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-74px)] md:px-10 md:py-8 sm:px-6 py-4 px-4">
      <Buttons onClickhandler={() => navigate(-1)} className="bg-btnColor px-4 py-2 rounded-md text-white mb-3">
        Go Back
      </Buttons>
      <div className="py-6 px-8 min-h-customHeight shadow-lg shadow-gray-300 rounded-md">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-96">
            <Blocks height="70" width="70" color="#4fa94d" ariaLabel="blocks-loading" />
            <span>Please wait...</span>
          </div>
        ) : editEnable ? (
          <>
            <QuillEditor ref={quillRef} readOnly={false} defaultValue={editorContent} onTextChange={setEditorContent} />
            <Buttons disabled={noteEditLoader} onClickhandler={onNoteEditHandler} className="bg-customRed mt-4 text-white px-4 py-2 rounded-sm">
              {noteEditLoader ? "Loading..." : "Update Note"}
            </Buttons>
          </>
        ) : (
          <>
            <p className="text-slate-900 ql-editor" dangerouslySetInnerHTML={{ __html: note?.parsedContent }}></p>
            {isAdmin && (
              <div className="mt-10">
                <h1 className="text-2xl text-center text-slate-700 font-semibold uppercase pt-10 pb-4">Audit Logs</h1>
                <div className="overflow-x-auto">
                  <DataGrid rows={rows} columns={auditLogscolumn} pageSizeOptions={[6]} disableRowSelectionOnClick disableColumnResize />
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <Modals open={modalOpen} setOpen={setModalOpen} noteId={id} />
    </div>
  );
};

export default NoteDetails;
