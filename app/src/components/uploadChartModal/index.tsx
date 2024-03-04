import React, { useState, useCallback, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { Line } from "react-chartjs-2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useStore } from "@/store";
import { fetchData } from "@/api";

const UploadChart = () => {
  const [chartData, setChartData] = useState({});
  const [isPublic, setIsPublic] = useState(false);
  const [chartName, setChartName] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const history = useHistory();
  const store = useStore();

  const fetchChartData = useCallback(async () => {
    try {
      const data = await fetchData();
      setChartData(data);
    } catch (error) {
      setError(error.message);
    }
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      await store.uploadChart(chartName, file, isPublic);
      history.push("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const chartDataMemoized = useMemo(() => {
    return {
      labels: chartData.labels,
      datasets: [
        {
          label: chartName,
          data: chartData.data,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
        },
      ],
    };
  }, [chartData, chartName]);

  return (
    <div className="upload-chart">
      <h1>Upload Chart</h1>
      <Label htmlFor="chart-name">Chart Name</Label>
      <Input
        id="chart-name"
        type="text"
        value={chartName}
        onChange={(e) => setChartName(e.target.value)}
        autoFocus
      />
      <Label htmlFor="chart-file">Upload Chart File</Label>
      <Input
        id="chart-file"
        type="file"
        onChange={handleFileChange}
        ref={fileInputRef}
      />
      <Checkbox
        id="is-public"
        checked={isPublic}
        onCheckedChange={(checked) => setIsPublic(checked)}
      >
        Is Public
      </Checkbox>
      {error && <p className="error">{error}</p>}
      <Button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..."
