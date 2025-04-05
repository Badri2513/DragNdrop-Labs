import React, { useState } from 'react';
import { Table2, Plus, Trash2, Edit2, Save, X } from 'lucide-react';

interface DataTabProps {
  elements: any[];
  onUpdateElementData: (elementId: string, data: any) => void;
  theme: 'light' | 'dark';
}

interface TableData {
  headers: string[];
  rows: string[][];
}

const DataTab: React.FC<DataTabProps> = ({ elements, onUpdateElementData, theme }) => {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<TableData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const tableElements = elements.filter(el => el.type === 'table');

  const handleEditTable = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (element) {
      setSelectedElement(elementId);
      setEditingData(element.properties.data || { headers: ['Header 1', 'Header 2'], rows: [['', '']] });
      setIsEditing(true);
    }
  };

  const handleAddRow = () => {
    if (editingData) {
      const newRow = new Array(editingData.headers.length).fill('');
      setEditingData({
        ...editingData,
        rows: [...editingData.rows, newRow]
      });
    }
  };

  const handleAddColumn = () => {
    if (editingData) {
      setEditingData({
        headers: [...editingData.headers, `Header ${editingData.headers.length + 1}`],
        rows: editingData.rows.map(row => [...row, ''])
      });
    }
  };

  const handleDeleteRow = (rowIndex: number) => {
    if (editingData) {
      setEditingData({
        ...editingData,
        rows: editingData.rows.filter((_: string[], index: number) => index !== rowIndex)
      });
    }
  };

  const handleDeleteColumn = (colIndex: number) => {
    if (editingData) {
      setEditingData({
        headers: editingData.headers.filter((_: string, index: number) => index !== colIndex),
        rows: editingData.rows.map(row => row.filter((_: string, index: number) => index !== colIndex))
      });
    }
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    if (editingData) {
      const newRows = [...editingData.rows];
      newRows[rowIndex][colIndex] = value;
      setEditingData({
        ...editingData,
        rows: newRows
      });
    }
  };

  const handleHeaderChange = (index: number, value: string) => {
    if (editingData) {
      const newHeaders = [...editingData.headers];
      newHeaders[index] = value;
      setEditingData({
        ...editingData,
        headers: newHeaders
      });
    }
  };

  const handleSave = () => {
    if (selectedElement && editingData) {
      onUpdateElementData(selectedElement, { data: editingData });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingData(null);
    setSelectedElement(null);
  };

  return (
    <div className={`p-4 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Table2 className="w-5 h-5" />
        Data Management
      </h2>

      {!isEditing ? (
        <div className="space-y-4">
          {tableElements.length === 0 ? (
            <p className="text-gray-500">No tables found in the design. Add a table element to manage its data.</p>
          ) : (
            <div className="space-y-4">
              {tableElements.map((element) => (
                <div
                  key={element.id}
                  className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Table: {element.id}</h3>
                    <button
                      onClick={() => handleEditTable(element.id)}
                      className={`p-2 rounded ${
                        theme === 'dark'
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-blue-500 hover:bg-blue-600'
                      } text-white`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          {(element.properties.data?.headers || ['Header 1', 'Header 2']).map((header: string, index: number) => (
                            <th
                              key={index}
                              className={`px-4 py-2 border ${
                                theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                              }`}
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(element.properties.data?.rows || [['', '']]).map((row: string[], rowIndex: number) => (
                          <tr key={rowIndex}>
                            {row.map((cell: string, cellIndex: number) => (
                              <td
                                key={cellIndex}
                                className={`px-4 py-2 border ${
                                  theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                                }`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Editing Table Data</h3>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className={`p-2 rounded ${
                  theme === 'dark'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className={`p-2 rounded ${
                  theme === 'dark'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-red-500 hover:bg-red-600'
                } text-white`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={handleAddRow}
              className={`p-2 rounded ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white flex items-center gap-2`}
            >
              <Plus className="w-4 h-4" />
              Add Row
            </button>
            <button
              onClick={handleAddColumn}
              className={`p-2 rounded ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white flex items-center gap-2`}
            >
              <Plus className="w-4 h-4" />
              Add Column
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {editingData?.headers.map((header: string, index: number) => (
                    <th
                      key={index}
                      className={`px-4 py-2 border ${
                        theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={header}
                          onChange={(e) => handleHeaderChange(index, e.target.value)}
                          className={`w-full p-1 rounded ${
                            theme === 'dark'
                              ? 'bg-gray-600 text-white'
                              : 'bg-white text-gray-900'
                          }`}
                        />
                        <button
                          onClick={() => handleDeleteColumn(index)}
                          className={`p-1 rounded ${
                            theme === 'dark'
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-red-500 hover:bg-red-600'
                          } text-white`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {editingData?.rows.map((row: string[], rowIndex: number) => (
                  <tr key={rowIndex}>
                    {row.map((cell: string, cellIndex: number) => (
                      <td
                        key={cellIndex}
                        className={`px-4 py-2 border ${
                          theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                        }`}
                      >
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => handleCellChange(rowIndex, cellIndex, e.target.value)}
                          className={`w-full p-1 rounded ${
                            theme === 'dark'
                              ? 'bg-gray-600 text-white'
                              : 'bg-white text-gray-900'
                          }`}
                        />
                      </td>
                    ))}
                    <td>
                      <button
                        onClick={() => handleDeleteRow(rowIndex)}
                        className={`p-1 rounded ${
                          theme === 'dark'
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-red-500 hover:bg-red-600'
                        } text-white`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTab; 