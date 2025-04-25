function Card({ title, value }: { title?: string; value: string | number }) {
  return (
    <div className="card">
      {title && <label>{title}</label>}
      <p>{value}</p>
    </div>
  );
}

export default Card;
