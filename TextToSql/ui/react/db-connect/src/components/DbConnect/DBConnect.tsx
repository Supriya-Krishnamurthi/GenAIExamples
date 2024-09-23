import React, { useState } from 'react';
import axios from 'axios';
import { Button, Text, TextInput, Title, Textarea } from '@mantine/core';
// import { notifications } from '@mantine/notifications';
import styleClasses from './dbconnect.module.scss'; // Importing the SCSS file

const DBConnect: React.FC = () => {
  const [formData, setFormData] = useState({
    user: 'testuser',
    database: 'chinook',
    host: '10.223.22.141',
    password: 'testpwd',
    port: '5432',
  });

  const [dbStatus, setDbStatus] = useState<string | null>(null);
  const [sqlStatus, setSqlStatus] = useState<string | null>(null);
  const [dberror, setDbError] = useState<string | null>(null);
  const [sqlerror, setSqlError] = useState<string | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [response, setResponse] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle question input changes
  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
  };

  // Handle form submission and API request
  const handleDBConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://10.223.24.242:9090/v1/test-connection', formData);
      
      if (response.data === true) {
        setDbStatus("Connected");
        setDbError(null);
        setIsConnected(true);
        setQuestion('');
        setResponse(null);
      } else {
        setDbStatus(null);
        setIsConnected(false);
        setDbError('Failed to connect to the database.');
        setSqlStatus(null);
      }
    } catch (err) {
      setDbError('Failed to connect to the database.');
      setIsConnected(false);
      setDbStatus(null);
    }
  };
  
  // Handle generating SQL query
  const handleGenerateSQL = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        input_text: question,
        conn_str: formData,
      };

      const response = await axios.post('http://10.223.24.242:9090/v1/texttosql', payload);
      setResponse(response.data.result.output); // Assuming the API returns an SQL query
      setSqlError(null)
      setSqlStatus('SQL query output generated successfully')
    } catch (err) {
      setSqlError('Failed to generate SQL query output.');
    }
  };

  return (
    <div className={styleClasses.dbconnectWrapper}>
      <div className={styleClasses.dbConnectSection}>
        <Title order={1}>Database Connection</Title>
        <form className={styleClasses.form} onSubmit={handleDBConnect}>
          <div className={styleClasses.inputField}>
            <TextInput
              label="Host"
              placeholder="Enter host"
              name="host"
              value={formData.host}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styleClasses.inputField}>
            <TextInput
              label="User"
              placeholder="Enter user"
              name="user"
              value={formData.user}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styleClasses.inputField}>
            <TextInput
              label="Database Name"
              placeholder="Enter database name"
              name="database"
              value={formData.database}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styleClasses.inputField}>
            <TextInput
              label="Password"
              placeholder="Enter password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styleClasses.inputField}>
            <TextInput
              label="Port"
              placeholder="Enter port"
              name="port"
              value={formData.port}
              onChange={handleChange}
              required
            />
          </div>

          <Button type="submit" className={styleClasses.submitButton} fullWidth>
            Connect
          </Button>
        </form>

        {dbStatus && <Text className={styleClasses.status}>Status: {dbStatus}</Text>}
        {dberror && <Text className={styleClasses.error}>Error: {dberror}</Text>}
      </div>

      {/* Text to SQL Section */}
      <div className={styleClasses.textToSQLSection}>
        <Title order={1}>Text To SQL</Title>
        {isConnected && (
          <form className={styleClasses.form} onSubmit={handleGenerateSQL}>
            <div className={styleClasses.sqlQuerySection}>
              <div className={styleClasses.inputField}>
                <label>Enter your question:</label>
                <Textarea
                  placeholder="Type your question here"
                  value={question}
                  onChange={handleQuestionChange}
                  required
                />
              </div>
            </div>

            <Button type="submit" className={styleClasses.submitButton} fullWidth>
              Generate SQL Query Output
            </Button>
          </form>
        )}

        {/* Display SQL query response */}
        {isConnected && response && (
          <div className={styleClasses.sqlQuerySection}>
            <div className={styleClasses.inputField}>
              <label>Generated SQL Query Output:</label>
              <Textarea value={response.replace('<|eot_id|>', '')} readOnly />
            </div>
          </div>
        )}

        {/* Display SQL generation status, error if any */}
        {sqlStatus && <Text className={styleClasses.status}>Status: {sqlStatus}</Text>}
        {sqlerror && <Text className={styleClasses.error}>Error: {sqlerror}</Text>}

      </div>
    </div>
  );
};

export default DBConnect;
