import { useEffect, useState, useMemo } from 'react';
import { useUsers, useUpdateUser } from '@/api';
import { AddDiagnosis, Maps } from '@/components';
import { getAddress, getLatLng } from '@/utils';
import { Toast } from '@/components';
/**
 * useMemo was used here due to the heavy and many computations needed
 */


// const getRecords = (data) => data?.map((user) => {
//   return user.user_metadata?.diagnosis?.map((record) => {
//     return { ...record, location: user.user_metadata?.location?.address }
//   })
// }).filter(element => element !== undefined)

const getRecords = (data) => (data?.map(user => user.user_metadata?.diagnosis))
const reduceObj = (object) => (Object.values(object)).reduce((value, key) => value.concat(key, object[key]))

const groupByLocation = (data) => {
  let groupedData = []
  let countries = new Set(data.map(record => record?.location).filter(element => element !== undefined))

  countries.forEach((country) => {
    const records = data.filter(element => element?.location === country);
    groupedData.push({ country, records })
  })

  return groupedData
}

const decodeCountries = async (data) => {
  for (let i = 0; i < data.length; i++) {
    let result = await getLatLng(data[i].country)
    data[i] = { ...data[i], lat: result.lat, lng: result.lng }
  }

  return data
}

function compare(a, b) {
  if (a.records.length < b.records.length) return 1;
  if (a.records.length > b.records.length) return -1;
  return 0;
}


const filterByType = (originalDAta, type) => {
  let myData = []
  for (let i = 0; i < originalDAta.length; i++) {
    let filtered = originalDAta[i]?.records?.filter((element) => element.type === type)

    let temp = {
      ...originalDAta[i],
      records: filtered,
    }
    myData.push(temp)
  }
  return myData
}

const divideDataByType = (data) => {
  let types = ['case', 'recovered', 'death']
  let res = []

  for (let type of types) {
    let filtered = filterByType(data, type)
    res.push(filtered)
  }

  return res
}

export const Dashboard = () => {
  const [showModal, setShowModal] = useState(false)
  const [location, setLocation] = useState({ lat: 29.9841575, lng: 31.4401621 })
  const [formattedData, setFormattedData] = useState([])
  const [diagnosisType, setDiagnosisType] = useState(0)
  const { data } = useUsers()
  const { mutate: updateUser, status } = useUpdateUser({})


  const handleAdd = () => setShowModal(true)
  const handleClose = () => setShowModal(false)

  let records = useMemo(() => groupByLocation(reduceObj(getRecords(data))), [data])
  let filteredData = useMemo(() => divideDataByType(formattedData), [formattedData])

  useEffect(() => {
    handleGetLocation()
  }, [])

  useEffect(() => {
    updateData()
  }, [records])

  const updateData = async () => {
    let res = await decodeCountries(records)
    setFormattedData(res)
  }

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async function (position) {
        let address = await getAddress(position.coords.latitude, position.coords.longitude)
        setLocation({
          address: address,
          lat: parseFloat(position.coords.latitude),
          lng: parseFloat(position.coords.longitude)
        })
      });
    } else {
      console.log("Not Available");
    }
  }

  return (
    <div className='container'>
      <div className='header'>
        <h2>
          Dashboard
        </h2>
        <button className='btn primaryBtn' onClick={handleAdd}>Add diagnosis</button>
      </div>
      <div className='details dashboardDetails'>
        <div className='showBtns'>
          <button onClick={() => setDiagnosisType(0)}>Show cases</button>
          <button onClick={() => setDiagnosisType(1)}>Show recovered</button>
          <button onClick={() => setDiagnosisType(2)}>Show death</button>
        </div>

        <Maps
          location={location}
          filteredData={filteredData || formattedData}
          diagnosisType={diagnosisType}
        />

        <div className='statistics'>
          <div className='type'>
            <ul>  <h3>Total cases</h3>  </ul>
            {filteredData[0].sort(compare).map((record, index) => (<p key={index}><span>{record.country}</span> <span>{record.records.length}</span></p>))}
          </div>

          <div className='type'>
            <ul> <h3>Total recovered</h3>  </ul>
            {filteredData[1].sort(compare).map((record, index) => (<p key={index}><span>{record.country}</span> <span>{record.records.length}</span></p>))}
          </div>

          <div className='type'>
            <ul>  <h3>Total deaths</h3>  </ul>
            {filteredData[2].sort(compare).map((record, index) => (<p key={index}><span>{record.country}</span> <span>{record.records.length}</span></p>))}
          </div>
        </div>
      </div>

      {showModal ?
        <div className='modal'>
          <AddDiagnosis handleClose={handleClose} updateUser={updateUser} />
        </div> : null}

      <Toast status={status} message="Recorded diagnoses" />
    </div>
  )
}

export const DashboardLoading = () => {
  return (
    <div className='container shimmerContainer'>
      <div className='header headerShimmer'>
        <h2></h2>
        <button className='btn primaryBtn'></button>
      </div>
      <div className='details dashboardShimmer'>
        <div className='map'></div>
        <div className='statistics'>
          <div className='type'>
            <ul></ul>
            <p><span></span> <span></span></p>
            <p><span></span> <span></span></p>
            <p><span></span> <span></span></p>
          </div>

          <div className='type'>
            <ul></ul>
            <p><span></span> <span></span></p>
            <p><span></span> <span></span></p>
            <p><span></span> <span></span></p>
          </div>

          <div className='type'>
            <ul></ul>
            <p><span></span> <span></span></p>
            <p><span></span> <span></span></p>
            <p><span></span> <span></span></p>
          </div>
        </div>
      </div>
    </div>
  )
}