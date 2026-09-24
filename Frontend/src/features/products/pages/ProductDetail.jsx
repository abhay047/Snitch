import React from 'react'
import { useParams } from 'react-router'

const ProductDetail = () => {

    const {productId} = useParams()
    console.log(productId);
    

  return (
    <div>ProductDetail</div>
  )
}

export default ProductDetail