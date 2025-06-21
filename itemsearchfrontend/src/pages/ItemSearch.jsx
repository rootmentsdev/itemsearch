import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Spinner,
  Alert,
  Card,
} from 'react-bootstrap';
import dayjs from 'dayjs';

import { searchItem } from '../utils/api';
import Header from '../componenets/Header';
import QRScanner from '../componenets/QrScanner';

const ItemSearch = () => {

  // Normalizes input to match keys in storeToLocCode
  const normalizeStoreName = (input) => {
    return input
      ?.toUpperCase()
      .replace(/\s+/g, '')
      .replace(/[^A-Z]/g, '')
      .trim();
  };

  const storeToLocCode = {
    'ZORUCCIEDAPPALLY': 1,
    'WAREHOUSE': 2,
    'SUITORGUYEDAPPALLY': 3,
    'HEADOFFICE': 4,
    'SUITORGUYTRIVANDRUM': 5,
    'ZORUCCIEDAPPAL': 6,
    'ZORUCCIPERINTHALMANNA': 7,
    'ZORUCCIKOTTAKKAL': 8,
    'SUITORGUYKOTTAYAM': 9,
    'SUITORGUYPERUMBAVOOR': 10,
    'SUITORGUYTHRISSUR': 11,
    'SUITORGUYCHAVAKKAD': 12,
    'SUITORGUYCALICUT': 13,
    'SUITORGUYVADAKARA': 14,
    'SUITORGUYEDAPPAL': 15,
    'SUITORGUYPERINTHALMANNA': 16,
    'SUITORGUYKOTTAKKAL': 17,
    'SUITORGUYMANJERI': 18,
    'SUITORGUYPALAKKAD': 19,
    'SUITORGUYKALPETTA': 20,
    'SUITORGUYKANNUR': 21,
  };

  const storeName = localStorage.getItem('storeName') || '';
  const normalizedStore = normalizeStoreName(storeName);
  const locationId = storeToLocCode[normalizedStore] || '';

  const [itemCode, setItemCode] = useState('');
  const [results, setResults] = useState([]);
  const [scannedResults, setScannedResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQR, setShowQR] = useState(false);

  const handleSearch = async (code = itemCode) => {
    if (!code.trim()) {
      setError('Please enter or scan a valid item code.');
      setResults([]);
      return;
    }

    setError('');
    setLoading(true);
    setResults([]);

    const cleanItemCode = code.trim();

    console.log('🔍 Store:', storeName);
    console.log('📌 Mapped locCode:', locationId);
    console.log('🔎 Searching itemCode:', cleanItemCode);

    try {
      const res = await searchItem(cleanItemCode, locationId);
      const data = res.data?.dataSet?.data || [];

      if (data.length > 0) {
        setResults(data);
      } else {
        setError('No records found for the scanned item in your location.');
      }
    } catch (err) {
      console.error('❌ Item search error:', err);
      setError('Failed to fetch item data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQRResult = async (scannedCode) => {
    setShowQR(false);
    setItemCode(scannedCode);
    setError('');
    setResults([]);

    try {
      const response = await searchItem(scannedCode, locationId);
      if (response.data?.dataSet?.data?.length > 0) {
        setScannedResults(response.data.dataSet.data);
      } else {
        setScannedResults([]);
        setError('No matching records found for scanned code.');
      }
    } catch (err) {
      setError('Failed to fetch data for scanned code.');
      setScannedResults([]);
    }
  };

  const onSearchButtonClick = () => {
    if (scannedResults.length > 0) {
      setResults(scannedResults);
      setError('');
    } else if (itemCode.trim()) {
      handleSearch(itemCode);
    } else {
      setError('Please enter or scan an item code first.');
      setResults([]);
    }
  };

  return (
    <>
      <Header />
      <Container fluid className="py-5 bg-light min-vh-100">
        <Row className="justify-content-center">
          <Col xs={11} md={10} lg={8}>
            <Card className="shadow-lg rounded-4 border-0">
              <Card.Body className="p-4">
                <h3 className="text-center mb-4 text-success fw-bold">
                  Item Search Portal
                </h3>

                <Form className="row g-3 align-items-end">
                  <Col xs={12} md={8}>
                    <Form.Group controlId="itemCodeInput">
                      <Form.Label>Item Code</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter Item Code"
                        value={itemCode}
                        onChange={(e) => setItemCode(e.target.value)}
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={6} md={2}>
                    <Button
                      variant="outline-success"
                      onClick={() => setShowQR(true)}
                      className="w-100 d-flex justify-content-center align-items-center"
                      title="Scan QR"
                    >
                      <i className="fa-solid fa-qrcode me-2"></i> Scan QR
                    </Button>
                  </Col>

                  <Col xs={6} md={2}>
                    <Button
                      variant="outline-success"
                      onClick={onSearchButtonClick}
                      className="w-100"
                      disabled={loading || !itemCode.trim()}
                    >
                      {loading ? <Spinner size="sm" animation="border" /> : 'Search'}
                    </Button>
                  </Col>
                </Form>

                {error && (
                  <Alert variant="danger" className="mt-3">
                    {error}
                  </Alert>
                )}

                {results.length > 0 && (
                  <div className="mt-4 table-responsive">
                    <Table bordered hover className="text-center align-middle" responsive>
                      <thead className="table-success">
                        <tr>
                          <th>#</th>
                          <th>Delivery Date</th>
                          <th>Booking Date</th>
                          <th>Return Date</th>
                          <th>Description</th>
                          <th>Customer Name</th>
                          <th>Phone No</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                              {item.deliveryDate
                                ? dayjs(item.deliveryDate).format('D/MMM/YYYY')
                                : '-'}
                            </td>
                            <td>
                              {item.bookingDate
                                ? dayjs(item.bookingDate).format('D/MMM/YYYY')
                                : '-'}
                            </td>
                            <td>
                              {item.returnDate
                                ? dayjs(item.returnDate).format('D/MMM/YYYY')
                                : '-'}
                            </td>
                            <td>{item.description || '-'}</td>
                            <td>{item.customerName || '-'}</td>
                            <td>{item.phoneNo || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {showQR && (
          <QRScanner
            locCode={locationId}
            onScan={handleQRResult}
            onClose={() => setShowQR(false)}
          />
        )}
      </Container>
    </>
  );
};

export default ItemSearch;
