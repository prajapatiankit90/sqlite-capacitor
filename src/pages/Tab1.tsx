import {
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import useSQLiteDB from "../composables/useSQLiteDB";
import useConfirmationAlert from "../composables/useConfirmationAlert";
import './Tab1.css';

type SQLItem = {
  id: number;
  fname: string;
  lname: string;
};

const Tab1: React.FC = () => {
  const defaultState = {
    fname: '',
    lname: ''
  }

  const [editItem, setEditItem] = useState<any>();
  const [data, setData] = useState(defaultState)
  const [inputName, setInputName] = useState("");
  const [items, setItems] = useState<Array<SQLItem>>();

  // hook for sqlite db
  const { performSQLAction, initialized } = useSQLiteDB();

  // hook for confirmation dialog
  const { showConfirmationAlert, ConfirmationAlert } = useConfirmationAlert();

  useEffect(() => {
    loadData();
  }, [initialized]);

  /**
   * do a select of the database
   */
  const loadData = async () => {
    try {
      // query db
      performSQLAction(async (db: SQLiteDBConnection | undefined) => {
        const respSelect = await db?.query(`SELECT * FROM voterList`);
        setItems(respSelect?.values);
      });
    } catch (error) {
      alert((error as Error).message);
      setItems([]);
    }
  };

  const updateItem = async () => {
    try {
      // add test record to db
      performSQLAction(
        async (db: SQLiteDBConnection | undefined) => {
          await db?.query(`UPDATE voterList SET fname=?, lname=? WHERE id=?`, [
            data.fname,
            data.lname,
            editItem?.id,
          ]);

          // update ui
          const respSelect = await db?.query(`SELECT * FROM voterList;`);
          setItems(respSelect?.values);
        },
        async () => {
          // setInputName("");
          setData({ ...defaultState })
          setEditItem(undefined);
        }
      );
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const addItem = async () => {
    console.log(data)

    try {
      // add test record to db
      performSQLAction(
        async (db: SQLiteDBConnection | undefined) => {
          await db?.query(`INSERT INTO voterList (id,fname,lname) values (?,?,?);`, [
            Date.now(),
            data.fname,
            data.lname
          ]);

          // update ui
          const respSelect = await db?.query(`SELECT * FROM voterList;`);
          setItems(respSelect?.values);
        },
        async () => {
          // setInputName("");
          setData({ ...defaultState })
        }
      );
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const confirmDelete = (itemId: number) => {
    showConfirmationAlert("Are You Sure You Want To Delete This Item?", () => {
      deleteItem(itemId);
    });
  };

  const deleteItem = async (itemId: number) => {
    try {
      // add test record to db
      performSQLAction(
        async (db: SQLiteDBConnection | undefined) => {
          await db?.query(`DELETE FROM voterList WHERE id=?;`, [itemId]);

          // update ui
          const respSelect = await db?.query(`SELECT * FROM voterList;`);
          setItems(respSelect?.values);
        },
        async () => {
          //setInputName("");
          setData({ ...defaultState })
        }
      );
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const doEditItem = (item: SQLItem | undefined) => {
    if (item) {
      setEditItem(item);
      setData({ ...data, fname: item.fname, lname: item.lname })
      // setInputName({item});
    } else {
      setEditItem(undefined);
      setInputName("");
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value })
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>REACT SQLITE</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        {editItem ? (
          <IonGrid>
            <IonRow>
              <IonCol size="3">
                <IonLabel>FIRST NAME</IonLabel>
              </IonCol>
              <IonCol size="9">
                <IonInput
                  type="text"
                  name="fname"
                  value={data.fname}
                  onIonInput={handleChange}
                  placeholder="FIRST NAME"
                ></IonInput>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol size="3">
                <IonLabel>LAST NAME</IonLabel>
              </IonCol>
              <IonCol size="9">
                <IonInput
                  name="lname"
                  type="text"
                  value={data.lname}
                  placeholder="LAST NAME"
                  onIonInput={handleChange}
                ></IonInput>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonButton onClick={() => doEditItem(undefined)}>CANCEL</IonButton>
              <IonButton onClick={updateItem}>UPDATE</IonButton>
            </IonRow>
          </IonGrid>
        ) : (
          <IonGrid>
            <IonRow>
              <IonCol size="3">
                <IonLabel>FIRST NAME</IonLabel>
              </IonCol>
              <IonCol size="9">
                <IonInput
                  type="text"
                  name="fname"
                  value={data.fname}
                  onIonInput={handleChange}
                ></IonInput>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol size="3">
                <IonLabel>LAST NAME</IonLabel>
              </IonCol>
              <IonCol size="9">
                <IonInput
                  type="text"
                  name="lname"
                  value={data.lname}
                  onIonInput={handleChange}
                ></IonInput>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonButton onClick={addItem} >
                ADD
              </IonButton>
            </IonRow>
          </IonGrid>
        )}

        <h3>THE SQLITE DATA</h3>

        {items?.map((item) => (
          <IonCard>
            <IonCardContent>
            <IonGrid>
              <IonRow key={item?.id}>
                <IonCol size="6">
                  <IonLabel className="ion-text-wrap">{item?.fname}</IonLabel>
                </IonCol>
                <IonCol size="6">
                  <IonLabel className="ion-text-wrap">{item?.lname}</IonLabel>
                </IonCol>
                <IonCol>
                  <IonButton onClick={() => doEditItem(item)}>EDIT</IonButton>
                  <IonButton onClick={() => confirmDelete(item.id)}>DELETE</IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
            </IonCardContent>
          </IonCard>
        ))}

        {ConfirmationAlert}
      </IonContent>
    </IonPage>
  );

};

export default Tab1;
